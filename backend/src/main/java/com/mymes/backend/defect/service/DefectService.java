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
    private final DefectMapper defectMapper;

    public List<DefectResponse> findByWorkOrder(Long workOrderId) {
        return defectRepository.findByWorkOrderIdOrderByCreatedAtDesc(workOrderId).stream()
                .map(defectMapper::toResponse)
                .toList();
    }

    public DefectResponse findById(Long id) {
        return defectMapper.toResponse(getDefect(id));
    }

    @Transactional
    public DefectResponse create(Long workOrderId, DefectCreateRequest request) {
        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);

        ProductionRecord productionRecord = null;
        if (request.getProductionRecordId() != null) {
            productionRecord = productionService.getRecord(request.getProductionRecordId());
            if (!productionRecord.getWorkOrder().getId().equals(workOrderId)) {
                throw new BusinessException(ErrorCode.DEFECT_PRODUCTION_RECORD_WORK_ORDER_MISMATCH);
            }
        }

        DefectRecord defect = DefectRecord.builder()
                .workOrder(workOrder)
                .productionRecord(productionRecord)
                .defectType(request.getDefectType())
                .qty(request.getQty())
                .causeMemo(request.getCauseMemo())
                .build();

        DefectRecord saved = defectRepository.save(defect);
        log.info("불량 등록 완료: id={}, workOrderId={}", saved.getId(), workOrderId);
        return defectMapper.toResponse(saved);
    }

    @Transactional
    public DefectResponse updateAction(Long id, DefectActionUpdateRequest request) {
        DefectRecord defect = getDefect(id);
        defect.updateAction(request.getActionStatus());
        log.info("불량 조치상태 변경 완료: id={}, action={}", id, request.getActionStatus());
        return defectMapper.toResponse(defect);
    }

    private DefectRecord getDefect(Long id) {
        return defectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEFECT_NOT_FOUND, String.valueOf(id)));
    }
}
