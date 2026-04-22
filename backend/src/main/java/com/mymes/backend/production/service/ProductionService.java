package com.mymes.backend.production.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.service.MfgProcessService;
import com.mymes.backend.production.dto.ProductionCreateRequest;
import com.mymes.backend.production.dto.ProductionResponse;
import com.mymes.backend.production.dto.ProductionUpdateRequest;
import com.mymes.backend.production.entity.ProductionRecord;
import com.mymes.backend.production.mapper.ProductionMapper;
import com.mymes.backend.production.repository.ProductionRepository;
import com.mymes.backend.workorder.entity.WorkOrderStatus;
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
public class ProductionService {

    private final ProductionRepository productionRepository;
    private final WorkOrderService workOrderService;
    private final MfgProcessService processService;
    private final ProductionMapper productionMapper;

    public List<ProductionResponse> findByWorkOrder(Long workOrderId) {
        return productionRepository.findByWorkOrderIdOrderByCreatedAtAsc(workOrderId).stream()
                .map(productionMapper::toResponse)
                .toList();
    }

    public ProductionResponse findById(Long id) {
        return productionMapper.toResponse(getRecord(id));
    }

    @Transactional
    public ProductionResponse create(Long workOrderId, ProductionCreateRequest request) {
        WorkOrder workOrder = workOrderService.getWorkOrder(workOrderId);
        if (workOrder.getStatus() != WorkOrderStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.PRODUCTION_WORK_ORDER_NOT_IN_PROGRESS);
        }

        MfgProcess process = processService.getProcess(request.getProcessId());

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
        return productionMapper.toResponse(saved);
    }

    @Transactional
    public ProductionResponse update(Long id, ProductionUpdateRequest request) {
        ProductionRecord record = getRecord(id);
        MfgProcess process = processService.getProcess(request.getProcessId());

        int defectQty = request.getDefectQty() != null ? request.getDefectQty() : 0;
        if (request.getCompletedQty() + defectQty > request.getInputQty()) {
            throw new BusinessException(ErrorCode.PRODUCTION_QTY_EXCEEDED);
        }

        record.update(process, request.getStartedAt(), request.getEndedAt(),
                request.getInputQty(), request.getCompletedQty(), defectQty);
        log.info("생산실적 수정 완료: id={}", id);
        return productionMapper.toResponse(record);
    }

    public ProductionRecord getRecord(Long id) {
        return productionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCTION_NOT_FOUND, String.valueOf(id)));
    }
}
