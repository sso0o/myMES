package com.mymes.backend.quality.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.inspectionstandard.entity.InspectionStandard;
import com.mymes.backend.inspectionstandard.service.InspectionStandardService;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.service.MfgProcessService;
import com.mymes.backend.production.entity.ProductionRecord;
import com.mymes.backend.quality.dto.request.QualityInspectionCreateRequest;
import com.mymes.backend.quality.dto.request.QualityInspectionUpdateRequest;
import com.mymes.backend.quality.dto.response.QualityInspectionResponse;
import com.mymes.backend.quality.entity.QualityInspection;
import com.mymes.backend.quality.entity.QualityInspectionStatus;
import com.mymes.backend.quality.mapper.QualityInspectionMapper;
import com.mymes.backend.quality.repository.QualityInspectionRepository;
import com.mymes.backend.workorder.entity.WorkOrder;
import com.mymes.backend.workorder.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QualityInspectionService {

    private static final DateTimeFormatter INSPECTION_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final int MAX_INSPECTION_NO_RETRIES = 3;

    private final QualityInspectionRepository qualityInspectionRepository;
    private final QualityInspectionMapper qualityInspectionMapper;
    private final ItemService itemService;
    private final MfgProcessService processService;
    private final WorkOrderService workOrderService;
    private final InspectionStandardService inspectionStandardService;

    /**
     * 전체 품질검사 목록을 검사일자 내림차순으로 조회합니다.
     *
     * @return 품질검사 응답 목록
     */
    public List<QualityInspectionResponse> findAll() {
        return qualityInspectionRepository.findAllByOrderByInspectionDateDescIdDesc().stream()
                .map(qualityInspectionMapper::toResponse)
                .toList();
    }

    /**
     * 상태별 품질검사 목록을 검사일자 내림차순으로 조회합니다.
     *
     * @param status 검사상태
     * @return 품질검사 응답 목록
     */
    public List<QualityInspectionResponse> findByStatus(QualityInspectionStatus status) {
        return qualityInspectionRepository.findByStatusOrderByInspectionDateDescIdDesc(status).stream()
                .map(qualityInspectionMapper::toResponse)
                .toList();
    }

    /**
     * ID로 품질검사를 단건 조회합니다.
     *
     * @param id 품질검사 ID
     * @return 품질검사 응답 DTO
     * @throws BusinessException 품질검사가 존재하지 않을 경우 (QUALITY_INSPECTION_NOT_FOUND)
     */
    public QualityInspectionResponse findById(Long id) {
        return qualityInspectionMapper.toResponse(getQualityInspection(id));
    }

    /**
     * 품질검사를 등록합니다.
     *
     * @param request 품질검사 생성 요청 DTO
     * @return 생성된 품질검사 응답 DTO
     * @throws BusinessException 수량 합계가 검사수량을 초과할 경우 (QUALITY_INSPECTION_QTY_INVALID)
     * @throws BusinessException 작업지시와 선택한 품목 또는 공정이 맞지 않을 경우
     */
    @Transactional
    public QualityInspectionResponse create(QualityInspectionCreateRequest request) {
        validateQuantities(request.getInspectionQty(), request.getPassQty(), request.getDefectQty());
        InspectionTargets targets = resolveTargets(request.getItemId(), request.getProcessId(), request.getWorkOrderId());
        InspectionStandard inspectionStandard = request.getInspectionStandardId() != null
                ? inspectionStandardService.getInspectionStandard(request.getInspectionStandardId())
                : null;

        for (int attempt = 1; attempt <= MAX_INSPECTION_NO_RETRIES; attempt++) {
            String inspectionNo = generateInspectionNo();
            QualityInspection inspection = QualityInspection.builder()
                    .inspectionNo(inspectionNo)
                    .inspectionDate(request.getInspectionDate())
                    .inspectionType(request.getInspectionType())
                    .status(request.getStatus())
                    .result(request.getResult())
                    .item(targets.item())
                    .process(targets.process())
                    .workOrder(targets.workOrder())
                    .inspectionStandard(inspectionStandard)
                    .inspectionQty(request.getInspectionQty())
                    .passQty(request.getPassQty())
                    .defectQty(request.getDefectQty())
                    .inspectorName(request.getInspectorName())
                    .remarks(request.getRemarks())
                    .build();

            try {
                QualityInspection saved = qualityInspectionRepository.saveAndFlush(inspection);
                log.info("품질검사 등록 완료: id={}, no={}", saved.getId(), saved.getInspectionNo());
                return qualityInspectionMapper.toResponse(saved);
            } catch (DataIntegrityViolationException e) {
                log.warn("품질검사 번호 충돌로 재시도합니다. attempt={}, inspectionNo={}", attempt, inspectionNo);
                if (attempt == MAX_INSPECTION_NO_RETRIES) {
                    throw new BusinessException(ErrorCode.QUALITY_INSPECTION_NO_GENERATION_FAILED);
                }
            }
        }

        throw new BusinessException(ErrorCode.QUALITY_INSPECTION_NO_GENERATION_FAILED);
    }

    /**
     * 품질검사를 수정합니다.
     *
     * @param id 품질검사 ID
     * @param request 품질검사 수정 요청 DTO
     * @return 수정된 품질검사 응답 DTO
     * @throws BusinessException 품질검사가 존재하지 않을 경우 (QUALITY_INSPECTION_NOT_FOUND)
     * @throws BusinessException 수량 합계가 검사수량을 초과할 경우 (QUALITY_INSPECTION_QTY_INVALID)
     */
    @Transactional
    public QualityInspectionResponse update(Long id, QualityInspectionUpdateRequest request) {
        validateQuantities(request.getInspectionQty(), request.getPassQty(), request.getDefectQty());
        QualityInspection inspection = getQualityInspection(id);
        InspectionTargets targets = resolveTargets(request.getItemId(), request.getProcessId(), request.getWorkOrderId());

        inspection.update(request.getInspectionDate(), request.getInspectionType(),
                request.getStatus(), request.getResult(), targets.item(), targets.process(),
                targets.workOrder(), request.getInspectionQty(), request.getPassQty(),
                request.getDefectQty(), request.getInspectorName(), request.getRemarks());
        log.info("품질검사 수정 완료: id={}", id);
        return qualityInspectionMapper.toResponse(inspection);
    }

    /**
     * 품질검사를 소프트 삭제합니다.
     *
     * @param id 품질검사 ID
     * @throws BusinessException 품질검사가 존재하지 않을 경우 (QUALITY_INSPECTION_NOT_FOUND)
     */
    @Transactional
    public void delete(Long id) {
        QualityInspection inspection = getQualityInspection(id);
        inspection.delete();
        log.info("품질검사 삭제 완료: id={}, no={}", id, inspection.getInspectionNo());
    }

    /**
     * 품질검사에 생산실적을 연결합니다. 생산실적 등록 시 자동 생성된 검사에만 사용됩니다.
     *
     * @param inspectionId    품질검사 ID
     * @param productionRecord 연결할 생산실적 엔티티
     */
    @Transactional
    public void linkProductionRecord(Long inspectionId, ProductionRecord productionRecord) {
        QualityInspection inspection = getQualityInspection(inspectionId);
        inspection.linkProductionRecord(productionRecord);
    }

    /**
     * ID로 품질검사 엔티티를 조회합니다.
     *
     * @param id 품질검사 ID
     * @return 품질검사 엔티티
     * @throws BusinessException 품질검사가 존재하지 않을 경우 (QUALITY_INSPECTION_NOT_FOUND)
     */
    public QualityInspection getQualityInspection(Long id) {
        return qualityInspectionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.QUALITY_INSPECTION_NOT_FOUND, String.valueOf(id)));
    }

    private InspectionTargets resolveTargets(Long itemId, Long processId, Long workOrderId) {
        Item item = itemService.getItem(itemId);
        MfgProcess process = processId != null ? processService.getProcess(processId) : null;
        WorkOrder workOrder = workOrderId != null ? workOrderService.getWorkOrder(workOrderId) : null;

        if (workOrder != null) {
            if (!workOrder.getItem().getId().equals(item.getId())) {
                throw new BusinessException(ErrorCode.QUALITY_INSPECTION_WORK_ORDER_ITEM_MISMATCH);
            }
            if (process != null && workOrder.getProcess() != null
                    && !workOrder.getProcess().getId().equals(process.getId())) {
                throw new BusinessException(ErrorCode.QUALITY_INSPECTION_WORK_ORDER_PROCESS_MISMATCH);
            }
        }

        return new InspectionTargets(item, process, workOrder);
    }

    private void validateQuantities(Integer inspectionQty, Integer passQty, Integer defectQty) {
        if (passQty + defectQty > inspectionQty) {
            throw new BusinessException(ErrorCode.QUALITY_INSPECTION_QTY_INVALID);
        }
    }

    private String generateInspectionNo() {
        String date = LocalDate.now().format(INSPECTION_DATE_FORMAT);
        String prefix = "QI-" + date + "-";
        int nextSequence = qualityInspectionRepository.findLatestInspectionNoByPrefix(prefix)
                .map(latestNo -> extractSequence(latestNo) + 1)
                .orElse(1);
        return prefix + String.format("%04d", nextSequence);
    }

    private int extractSequence(String inspectionNo) {
        try {
            int separatorIndex = inspectionNo.lastIndexOf('-');
            return Integer.parseInt(inspectionNo.substring(separatorIndex + 1));
        } catch (NumberFormatException | IndexOutOfBoundsException e) {
            log.warn("품질검사 번호 채번 시퀀스 추출 실패, 1부터 시작합니다. inspectionNo={}", inspectionNo);
            return 0;
        }
    }

    private record InspectionTargets(Item item, MfgProcess process, WorkOrder workOrder) {
    }
}
