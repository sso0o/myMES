package com.mymes.backend.defect.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.defect.dto.DefectActionUpdateRequest;
import com.mymes.backend.defect.dto.DefectCreateRequest;
import com.mymes.backend.defect.dto.DefectResponse;
import com.mymes.backend.defect.entity.DefectRecord;
import com.mymes.backend.defect.mapper.DefectMapper;
import com.mymes.backend.defect.repository.DefectRepository;
import com.mymes.backend.production.entity.ProductionRecord;
import com.mymes.backend.production.service.ProductionService;
import com.mymes.backend.quality.entity.QualityInspection;
import com.mymes.backend.quality.service.QualityInspectionService;
import com.mymes.backend.workorder.entity.WorkOrder;
import com.mymes.backend.workorder.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefectService {

    private final DefectRepository defectRepository;
    private final WorkOrderService workOrderService;
    private final ProductionService productionService;
    private final QualityInspectionService qualityInspectionService;
    private final DefectMapper defectMapper;

    /**
     * 전체 불량 기록 목록을 최신순으로 조회합니다.
     *
     * @return 불량 기록 응답 목록
     */
    public List<DefectResponse> findAll() {
        return defectRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(defectMapper::toResponse)
                .toList();
    }

    /**
     * 작업지시별 불량 기록 목록을 최신순으로 조회합니다.
     *
     * @param workOrderId 작업지시 ID
     * @return 불량 기록 응답 목록
     */
    public List<DefectResponse> findByWorkOrder(Long workOrderId) {
        return defectRepository.findByWorkOrderIdOrderByCreatedAtDesc(workOrderId).stream()
                .map(defectMapper::toResponse)
                .toList();
    }

    /**
     * 품질검사별 불량 기록 목록을 최신순으로 조회합니다.
     *
     * @param qualityInspectionId 품질검사 ID
     * @return 불량 기록 응답 목록
     */
    public List<DefectResponse> findByQualityInspection(Long qualityInspectionId) {
        return defectRepository.findByQualityInspectionIdOrderByCreatedAtDesc(qualityInspectionId).stream()
                .map(defectMapper::toResponse)
                .toList();
    }

    /**
     * ID로 불량 기록을 단건 조회합니다.
     *
     * @param id 불량 기록 ID
     * @return 불량 기록 응답 DTO
     */
    public DefectResponse findById(Long id) {
        return defectMapper.toResponse(getDefect(id));
    }

    /**
     * 작업지시에 불량 기록을 등록합니다.
     *
     * @param workOrderId 작업지시 ID
     * @param request 불량 생성 요청 DTO
     * @return 생성된 불량 기록 응답 DTO
     */
    @Transactional
    public DefectResponse create(Long workOrderId, DefectCreateRequest request) {
        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);
        QualityInspection qualityInspection = resolveQualityInspection(request.getQualityInspectionId());
        if (qualityInspection != null && qualityInspection.getWorkOrder() != null
                && !qualityInspection.getWorkOrder().getId().equals(workOrderId)) {
            throw new BusinessException(ErrorCode.DEFECT_QUALITY_INSPECTION_WORK_ORDER_MISMATCH);
        }
        return createDefect(workOrder, qualityInspection, request);
    }

    /**
     * 품질검사에 불량 기록을 등록합니다.
     *
     * @param qualityInspectionId 품질검사 ID
     * @param request 불량 생성 요청 DTO
     * @return 생성된 불량 기록 응답 DTO
     */
    @Transactional
    public DefectResponse createByQualityInspection(Long qualityInspectionId, DefectCreateRequest request) {
        QualityInspection qualityInspection = qualityInspectionService.getQualityInspection(qualityInspectionId);
        WorkOrder workOrder = qualityInspection.getWorkOrder();
        return createDefect(workOrder, qualityInspection, request);
    }

    private DefectResponse createDefect(WorkOrder workOrder, QualityInspection qualityInspection,
                                        DefectCreateRequest request) {
        ProductionRecord productionRecord = resolveProductionRecord(request.getProductionRecordId(), workOrder);
        DefectRecord defect = DefectRecord.builder()
                .workOrder(workOrder)
                .productionRecord(productionRecord)
                .qualityInspection(qualityInspection)
                .defectType(request.getDefectType())
                .qty(request.getQty())
                .defectDescription(request.getDefectDescription())
                .causeCategory(request.getCauseCategory())
                .causeMemo(request.getCauseMemo())
                .actionMemo(request.getActionMemo())
                .disposition(request.getDisposition())
                .assigneeName(request.getAssigneeName())
                .build();

        DefectRecord saved = defectRepository.save(defect);
        log.info("불량 등록 완료: id={}, workOrderId={}, qualityInspectionId={}",
                saved.getId(),
                workOrder != null ? workOrder.getId() : null,
                qualityInspection != null ? qualityInspection.getId() : null);
        return defectMapper.toResponse(saved);
    }

    /**
     * 불량 조치 정보를 수정합니다.
     *
     * @param id 불량 기록 ID
     * @param request 조치 수정 요청 DTO
     * @return 수정된 불량 기록 응답 DTO
     */
    @Transactional
    public DefectResponse updateAction(Long id, DefectActionUpdateRequest request) {
        DefectRecord defect = getDefect(id);
        defect.updateAction(request.getActionStatus(), request.getActionMemo(),
                request.getDisposition(), request.getAssigneeName());
        log.info("불량 조치상태 변경 완료: id={}, action={}", id, request.getActionStatus());
        return defectMapper.toResponse(defect);
    }

    private ProductionRecord resolveProductionRecord(Long productionRecordId, WorkOrder workOrder) {
        if (productionRecordId == null) {
            return null;
        }
        ProductionRecord productionRecord = productionService.getRecord(productionRecordId);
        if (workOrder != null && !productionRecord.getWorkOrder().getId().equals(workOrder.getId())) {
            throw new BusinessException(ErrorCode.DEFECT_PRODUCTION_RECORD_WORK_ORDER_MISMATCH);
        }
        return productionRecord;
    }

    private QualityInspection resolveQualityInspection(Long qualityInspectionId) {
        if (qualityInspectionId == null) {
            return null;
        }
        return qualityInspectionService.getQualityInspection(qualityInspectionId);
    }

    private DefectRecord getDefect(Long id) {
        return defectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEFECT_NOT_FOUND, String.valueOf(id)));
    }
}
