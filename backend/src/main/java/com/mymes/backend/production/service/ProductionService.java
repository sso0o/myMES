package com.mymes.backend.production.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.inspectionstandard.service.InspectionStandardService;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.production.dto.ProductionCreateRequest;
import com.mymes.backend.production.dto.ProductionResponse;
import com.mymes.backend.production.dto.ProductionUpdateRequest;
import com.mymes.backend.production.entity.ProductionRecord;
import com.mymes.backend.production.mapper.ProductionMapper;
import com.mymes.backend.production.repository.ProductionRepository;
import com.mymes.backend.quality.dto.request.QualityInspectionCreateRequest;
import com.mymes.backend.quality.dto.response.QualityInspectionResponse;
import com.mymes.backend.quality.entity.QualityInspectionType;
import com.mymes.backend.quality.service.QualityInspectionService;
import com.mymes.backend.workorder.entity.WorkOrderStatus;
import com.mymes.backend.workorder.entity.WorkOrder;
import com.mymes.backend.workorder.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductionService {

    private final ProductionRepository productionRepository;
    private final WorkOrderService workOrderService;
    private final ProductionMapper productionMapper;
    private final InspectionStandardService inspectionStandardService;
    private final QualityInspectionService qualityInspectionService;

    /**
     * 작업지시별 생산실적 목록을 등록일시 오름차순으로 조회합니다.
     *
     * @param workOrderId 작업지시 ID
     * @return 생산실적 응답 목록
     */
    public List<ProductionResponse> findByWorkOrder(Long workOrderId) {
        return productionRepository.findByWorkOrderIdOrderByCreatedAtAsc(workOrderId).stream()
                .map(productionMapper::toResponse)
                .toList();
    }

    /**
     * ID로 생산실적을 단건 조회합니다.
     *
     * @param id 생산실적 ID
     * @return 생산실적 응답 DTO
     * @throws BusinessException 생산실적이 존재하지 않을 경우 (PRODUCTION_NOT_FOUND)
     */
    public ProductionResponse findById(Long id) {
        return productionMapper.toResponse(getRecord(id));
    }

    /**
     * 생산실적을 등록합니다. 해당 공정에 활성화된 검사 기준이 존재하면 공정검사를 자동으로 생성합니다.
     *
     * @param workOrderId 작업지시 ID
     * @param request     생산실적 생성 요청 DTO
     * @return 생성된 생산실적 응답 DTO (자동 생성된 검사 ID 포함)
     * @throws BusinessException 작업지시가 진행 중이 아닌 경우 (PRODUCTION_WORK_ORDER_NOT_IN_PROGRESS)
     * @throws BusinessException 수량 합계가 투입수량을 초과한 경우 (PRODUCTION_QTY_EXCEEDED)
     */
    @Transactional
    public ProductionResponse create(Long workOrderId, ProductionCreateRequest request) {
        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);
        if (workOrder.getStatus() != WorkOrderStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.PRODUCTION_WORK_ORDER_NOT_IN_PROGRESS);
        }

        MfgProcess process = workOrder.getProcess();

        int defectQty = request.getDefectQty() != null ? request.getDefectQty() : 0;
        if (request.getCompletedQty() + defectQty > request.getInputQty()) {
            throw new BusinessException(ErrorCode.PRODUCTION_QTY_EXCEEDED);
        }

        ProductionRecord record = ProductionRecord.builder()
                .workOrder(workOrder)
                .process(process)
                .startedAt(request.getStartedAt())
                .endedAt(request.getEndedAt())
                .inputQty(request.getInputQty())
                .completedQty(request.getCompletedQty())
                .defectQty(defectQty)
                .build();

        ProductionRecord saved = productionRepository.save(record);
        log.info("생산실적 등록 완료: id={}, workOrderId={}", saved.getId(), workOrderId);

        Long autoCreatedInspectionId = createInspectionIfRequired(workOrder, request.getCompletedQty());
        ProductionResponse response = productionMapper.toResponse(saved);
        if (autoCreatedInspectionId != null) {
            response = response.toBuilder().autoCreatedInspectionId(autoCreatedInspectionId).build();
        }
        return response;
    }

    /**
     * 공정에 활성화된 검사 기준이 있으면 공정검사를 자동 생성합니다.
     *
     * @param workOrder    작업지시 (품목·공정 정보 포함)
     * @param completedQty 생산실적의 완료수량 (검사수량으로 사용)
     * @return 생성된 품질검사 ID, 검사 기준이 없으면 null
     */
    private Long createInspectionIfRequired(WorkOrder workOrder, int completedQty) {
        Long itemId = workOrder.getItem().getId();
        Long processId = workOrder.getProcess().getId();

        if (!inspectionStandardService.existsByItemAndProcess(itemId, processId)) {
            return null;
        }

        QualityInspectionCreateRequest inspReq = QualityInspectionCreateRequest.builder()
                .itemId(itemId)
                .processId(processId)
                .workOrderId(workOrder.getId())
                .inspectionType(QualityInspectionType.IN_PROCESS)
                .inspectionDate(LocalDate.now())
                .inspectionQty(completedQty)
                .passQty(0)
                .defectQty(0)
                .build();

        QualityInspectionResponse inspection = qualityInspectionService.create(inspReq);
        log.info("공정검사 자동 생성: inspectionId={}, workOrderId={}, itemId={}, processId={}",
                inspection.getId(), workOrder.getId(), itemId, processId);
        return inspection.getId();
    }

    /**
     * 생산실적을 수정합니다.
     *
     * @param id      생산실적 ID
     * @param request 생산실적 수정 요청 DTO
     * @return 수정된 생산실적 응답 DTO
     * @throws BusinessException 생산실적이 존재하지 않을 경우 (PRODUCTION_NOT_FOUND)
     * @throws BusinessException 수량 합계가 투입수량을 초과한 경우 (PRODUCTION_QTY_EXCEEDED)
     */
    @Transactional
    public ProductionResponse update(Long id, ProductionUpdateRequest request) {
        ProductionRecord record = getRecord(id);

        int defectQty = request.getDefectQty() != null ? request.getDefectQty() : 0;
        if (request.getCompletedQty() + defectQty > request.getInputQty()) {
            throw new BusinessException(ErrorCode.PRODUCTION_QTY_EXCEEDED);
        }

        record.update(record.getProcess(), request.getStartedAt(), request.getEndedAt(),
                request.getInputQty(), request.getCompletedQty(), defectQty);
        log.info("생산실적 수정 완료: id={}", id);
        return productionMapper.toResponse(record);
    }

    /**
     * ID로 생산실적 엔티티를 조회합니다.
     *
     * @param id 생산실적 ID
     * @return 생산실적 엔티티
     * @throws BusinessException 생산실적이 존재하지 않을 경우 (PRODUCTION_NOT_FOUND)
     */
    public ProductionRecord getRecord(Long id) {
        return productionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCTION_NOT_FOUND, String.valueOf(id)));
    }
}
