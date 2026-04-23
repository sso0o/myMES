package com.mymes.backend.workorder.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.service.MfgProcessService;
import com.mymes.backend.workorder.dto.WorkOrderCreateRequest;
import com.mymes.backend.workorder.dto.WorkOrderResponse;
import com.mymes.backend.workorder.dto.WorkOrderUpdateRequest;
import com.mymes.backend.workorder.entity.Priority;
import com.mymes.backend.workorder.entity.WorkOrder;
import com.mymes.backend.workorder.entity.WorkOrderStatus;
import com.mymes.backend.workorder.mapper.WorkOrderMapper;
import com.mymes.backend.workorder.repository.WorkOrderRepository;
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
public class WorkOrderService {

    private static final DateTimeFormatter WORK_ORDER_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final int MAX_WORK_ORDER_NO_RETRIES = 3;

    private final WorkOrderRepository workOrderRepository;
    private final ItemService itemService;
    private final MfgProcessService processService;
    private final WorkOrderMapper workOrderMapper;

    public List<WorkOrderResponse> findAll() {
        return workOrderRepository.findAll().stream()
                .map(workOrderMapper::toResponse)
                .toList();
    }

    public List<WorkOrderResponse> findByStatus(WorkOrderStatus status) {
        return workOrderRepository.findByStatusOrderByDueDateAsc(status).stream()
                .map(workOrderMapper::toResponse)
                .toList();
    }

    public WorkOrderResponse findById(Long id) {
        return workOrderMapper.toResponse(getWorkOrder(id));
    }

    @Transactional
    public WorkOrderResponse create(WorkOrderCreateRequest request) {
        Item item = itemService.getItem(request.getItemId());
        MfgProcess process = request.getProcessId() != null
                ? processService.getProcess(request.getProcessId()) : null;

        for (int attempt = 1; attempt <= MAX_WORK_ORDER_NO_RETRIES; attempt++) {
            String workOrderNo = generateWorkOrderNo();
            WorkOrder workOrder = WorkOrder.builder()
                    .workOrderNo(workOrderNo)
                    .item(item)
                    .plannedQty(request.getPlannedQty())
                    .priority(request.getPriority())
                    .process(process)
                    .workerName(request.getWorkerName())
                    .dueDate(request.getDueDate())
                    .build();

            try {
                WorkOrder saved = workOrderRepository.saveAndFlush(workOrder);
                log.info("작업지시 생성 완료: id={}, no={}", saved.getId(), saved.getWorkOrderNo());
                return workOrderMapper.toResponse(saved);
            } catch (DataIntegrityViolationException e) {
                log.warn("작업지시 번호 충돌로 재시도합니다. attempt={}, workOrderNo={}", attempt, workOrderNo);
                if (attempt == MAX_WORK_ORDER_NO_RETRIES) {
                    throw new BusinessException(ErrorCode.WORK_ORDER_NO_GENERATION_FAILED);
                }
            }
        }

        throw new BusinessException(ErrorCode.WORK_ORDER_NO_GENERATION_FAILED);
    }

    @Transactional
    public WorkOrderResponse update(Long id, WorkOrderUpdateRequest request) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getStatus() != WorkOrderStatus.WAITING) {
            throw new BusinessException(ErrorCode.WORK_ORDER_NOT_MODIFIABLE);
        }
        Item item = itemService.getItem(request.getItemId());
        MfgProcess process = request.getProcessId() != null
                ? processService.getProcess(request.getProcessId()) : null;
        workOrder.update(item, request.getPlannedQty(), request.getPriority(),
                process, request.getWorkerName(), request.getDueDate());
        log.info("작업지시 수정 완료: id={}", id);
        return workOrderMapper.toResponse(workOrder);
    }

    @Transactional
    public WorkOrderResponse changeStatus(Long id, WorkOrderStatus newStatus) {
        WorkOrder workOrder = getWorkOrder(id);
        workOrder.changeStatus(newStatus);
        log.info("작업지시 상태 변경 완료: id={}, status={}", id, newStatus);
        return workOrderMapper.toResponse(workOrder);
    }

    @Transactional
    public void delete(Long id) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getStatus() != WorkOrderStatus.WAITING) {
            throw new BusinessException(ErrorCode.WORK_ORDER_NOT_DELETABLE);
        }
        workOrder.delete();
        log.info("작업지시 삭제 완료: id={}", id);
    }

    @Transactional
    public WorkOrder createForPlan(Item item, Integer plannedQty, LocalDate plannedDate) {
        for (int attempt = 1; attempt <= MAX_WORK_ORDER_NO_RETRIES; attempt++) {
            String workOrderNo = generateWorkOrderNo();
            WorkOrder workOrder = WorkOrder.builder()
                    .workOrderNo(workOrderNo)
                    .item(item)
                    .plannedQty(plannedQty)
                    .priority(Priority.MEDIUM)
                    .dueDate(plannedDate)
                    .build();
            try {
                WorkOrder saved = workOrderRepository.saveAndFlush(workOrder);
                log.info("생산계획 발행으로 작업지시 생성 완료: id={}, no={}", saved.getId(), saved.getWorkOrderNo());
                return saved;
            } catch (DataIntegrityViolationException e) {
                log.warn("작업지시 번호 충돌로 재시도합니다. attempt={}", attempt);
                if (attempt == MAX_WORK_ORDER_NO_RETRIES) {
                    throw new BusinessException(ErrorCode.WORK_ORDER_NO_GENERATION_FAILED);
                }
            }
        }
        throw new BusinessException(ErrorCode.WORK_ORDER_NO_GENERATION_FAILED);
    }

    public WorkOrder getWorkOrder(Long id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORK_ORDER_NOT_FOUND, String.valueOf(id)));
    }

    private String generateWorkOrderNo() {
        String date = LocalDate.now().format(WORK_ORDER_DATE_FORMAT);
        String prefix = "WO-" + date + "-";
        int nextSequence = workOrderRepository.findLatestWorkOrderNoByPrefix(prefix)
                .map(latestNo -> extractSequence(latestNo) + 1)
                .orElse(1);

        return prefix + String.format("%04d", nextSequence);
    }

    private int extractSequence(String workOrderNo) {
        int separatorIndex = workOrderNo.lastIndexOf('-');
        return Integer.parseInt(workOrderNo.substring(separatorIndex + 1));
    }
}
