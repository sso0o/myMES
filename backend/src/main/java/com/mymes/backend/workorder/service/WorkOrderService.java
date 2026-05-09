package com.mymes.backend.workorder.service;

import com.mymes.backend.bom.entity.BomVersion;
import com.mymes.backend.bom.service.BomVersionService;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.equipment.entity.Equipment;
import com.mymes.backend.equipment.service.EquipmentService;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.itemprocess.entity.ItemProcess;
import com.mymes.backend.itemprocess.service.ItemProcessService;
import com.mymes.backend.planning.entity.ProductionPlan;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.service.MfgProcessService;
import com.mymes.backend.processEquipment.service.ProcessEquipmentService;
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
    private final BomVersionService bomVersionService;
    private final EquipmentService equipmentService;
    private final ProcessEquipmentService processEquipmentService;
    private final ItemProcessService itemProcessService;

    /**
     * 전체 작업지시 목록을 생산일, 납기일 오름차순으로 조회합니다.
     *
     * @return 작업지시 응답 목록
     */
    public List<WorkOrderResponse> findAll() {
        return workOrderRepository.findAllByOrderByProductionDateAscDueDateAsc().stream()
                .map(workOrderMapper::toResponse)
                .toList();
    }

    /**
     * 상태별 작업지시 목록을 생산일, 납기일 오름차순으로 조회합니다.
     *
     * @param status 작업지시 상태
     * @return 작업지시 응답 목록
     */
    public List<WorkOrderResponse> findByStatus(WorkOrderStatus status) {
        return workOrderRepository.findByStatusOrderByProductionDateAscDueDateAsc(status).stream()
                .map(workOrderMapper::toResponse)
                .toList();
    }

    /**
     * ID로 작업지시를 단건 조회합니다.
     *
     * @param id 작업지시 ID
     * @return 작업지시 응답 DTO
     */
    public WorkOrderResponse findById(Long id) {
        return workOrderMapper.toResponse(getWorkOrder(id));
    }

    /**
     * 작업지시를 생성합니다.
     *
     * @param request 작업지시 생성 요청
     * @return 생성된 작업지시 응답 DTO
     */
    @Transactional
    public WorkOrderResponse create(WorkOrderCreateRequest request) {
        Item item = itemService.getItem(request.getItemId());
        MfgProcess process = request.getProcessId() != null
                ? processService.getProcess(request.getProcessId()) : null;
        validateItemProcess(item, process);
        Equipment equipment = resolveEquipment(process, request.getEquipmentId());

        BomVersion bomVersion = bomVersionService.findActiveVersion(item.getId()).orElse(null);

        for (int attempt = 1; attempt <= MAX_WORK_ORDER_NO_RETRIES; attempt++) {
            String workOrderNo = generateWorkOrderNo();
            WorkOrder workOrder = WorkOrder.builder()
                    .workOrderNo(workOrderNo)
                    .item(item)
                    .plannedQty(request.getPlannedQty())
                    .priority(request.getPriority())
                    .process(process)
                    .equipment(equipment)
                    .workerName(request.getWorkerName())
                    .productionDate(request.getProductionDate())
                    .dueDate(request.getDueDate())
                    .bomVersion(bomVersion)
                    .build();

            try {
                WorkOrder saved = workOrderRepository.saveAndFlush(workOrder);
                log.info("작업지시 생성 완료: id={}, no={}, bomVersionId={}",
                        saved.getId(), saved.getWorkOrderNo(),
                        bomVersion != null ? bomVersion.getId() : null);
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

    /**
     * 대기 상태의 작업지시 내용을 수정합니다.
     *
     * @param id 작업지시 ID
     * @param request 작업지시 수정 요청
     * @return 수정된 작업지시 응답 DTO
     */
    @Transactional
    public WorkOrderResponse update(Long id, WorkOrderUpdateRequest request) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getStatus() != WorkOrderStatus.WAITING) {
            throw new BusinessException(ErrorCode.WORK_ORDER_NOT_MODIFIABLE);
        }
        Item item = itemService.getItem(request.getItemId());
        MfgProcess process = request.getProcessId() != null
                ? processService.getProcess(request.getProcessId()) : null;
        validateItemProcess(item, process);
        Equipment equipment = resolveEquipment(process, request.getEquipmentId());
        workOrder.update(item, request.getPlannedQty(), request.getPriority(),
                process, equipment, request.getWorkerName(), request.getProductionDate(), request.getDueDate());
        log.info("작업지시 수정 완료: id={}", id);
        return workOrderMapper.toResponse(workOrder);
    }

    /**
     * 작업지시 상태를 다음 단계로 변경합니다.
     * 대기→진행 전이 시 2번째 이상 공정은 이전 공정(sequence - 1)이 완료 상태여야 합니다.
     *
     * @param id 작업지시 ID
     * @param newStatus 변경할 상태
     * @return 상태가 변경된 작업지시 응답 DTO
     * @throws BusinessException 이전 공정이 완료되지 않은 경우 (WORK_ORDER_PREV_PROCESS_NOT_COMPLETED)
     */
    @Transactional
    public WorkOrderResponse changeStatus(Long id, WorkOrderStatus newStatus) {
        WorkOrder workOrder = getWorkOrder(id);
        if (newStatus == WorkOrderStatus.IN_PROGRESS
                && workOrder.getSequence() != null
                && workOrder.getSequence() > 1) {
            workOrderRepository.findByWorkOrderNoAndSequence(workOrder.getWorkOrderNo(), workOrder.getSequence() - 1)
                    .ifPresent(prev -> {
                        if (prev.getStatus() != WorkOrderStatus.COMPLETED) {
                            throw new BusinessException(ErrorCode.WORK_ORDER_PREV_PROCESS_NOT_COMPLETED);
                        }
                    });
        }
        workOrder.changeStatus(newStatus);
        log.info("작업지시 상태 변경 완료: id={}, status={}", id, newStatus);
        return workOrderMapper.toResponse(workOrder);
    }

    /**
     * 대기 상태의 작업지시를 소프트 삭제합니다.
     *
     * @param id 작업지시 ID
     */
    @Transactional
    public void delete(Long id) {
        WorkOrder workOrder = getWorkOrder(id);
        if (workOrder.getStatus() != WorkOrderStatus.WAITING) {
            throw new BusinessException(ErrorCode.WORK_ORDER_NOT_DELETABLE);
        }
        workOrder.delete();
        log.info("작업지시 삭제 완료: id={}", id);
    }

    /**
     * 생산계획 발행 시 품목의 공정 수만큼 작업지시를 생성합니다.
     * 생성된 작업지시는 모두 동일한 작업지시번호를 공유하며, 각 공정·순번 정보를 개별 보유합니다.
     * 품목에 등록된 공정이 없으면 예외를 던집니다.
     *
     * @param plan 발행할 생산계획 엔티티
     * @return 생성된 작업지시 엔티티 목록 (공정 순번 ASC)
     * @throws BusinessException 품목에 등록된 공정이 없는 경우 (PLAN_NO_PROCESS_FOR_ITEM)
     */
    @Transactional
    public List<WorkOrder> createAllForPlan(ProductionPlan plan) {
        List<ItemProcess> itemProcesses = itemProcessService.findAllEntitiesByItemId(plan.getItem().getId());
        if (itemProcesses.isEmpty()) {
            throw new BusinessException(ErrorCode.PLAN_NO_PROCESS_FOR_ITEM);
        }

        BomVersion bomVersion = bomVersionService.findActiveVersion(plan.getItem().getId()).orElse(null);
        String workOrderNo = generateWorkOrderNo();

        List<WorkOrder> workOrders = itemProcesses.stream()
                .map(ip -> WorkOrder.builder()
                        .workOrderNo(workOrderNo)
                        .item(plan.getItem())
                        .plannedQty(plan.getPlannedQty())
                        .priority(Priority.MEDIUM)
                        .process(ip.getProcess())
                        .sequence(ip.getSequence())
                        .productionDate(plan.getPlannedDate())
                        .dueDate(plan.getDueDate())
                        .bomVersion(bomVersion)
                        .productionPlan(plan)
                        .build())
                .toList();

        List<WorkOrder> saved = workOrderRepository.saveAll(workOrders);
        log.info("생산계획 발행으로 작업지시 생성 완료: planId={}, workOrderNo={}, processCount={}",
                plan.getId(), workOrderNo, saved.size());
        return saved;
    }

    /**
     * ID로 작업지시 엔티티를 조회합니다.
     *
     * @param id 작업지시 ID
     * @return 작업지시 엔티티
     */
    public WorkOrder getWorkOrder(Long id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORK_ORDER_NOT_FOUND, String.valueOf(id)));
    }

    private Equipment resolveEquipment(MfgProcess process, Long equipmentId) {
        if (equipmentId == null) {
            return null;
        }
        if (process == null) {
            throw new BusinessException(ErrorCode.WORK_ORDER_PROCESS_REQUIRED_FOR_EQUIPMENT);
        }
        Equipment equipment = equipmentService.getEquipment(equipmentId);
        if (!processEquipmentService.existsByProcessAndEquipment(process.getId(), equipment.getId())) {
            throw new BusinessException(ErrorCode.WORK_ORDER_EQUIPMENT_NOT_AVAILABLE);
        }
        return equipment;
    }

    private void validateItemProcess(Item item, MfgProcess process) {
        if (process == null) {
            return;
        }
        if (!itemProcessService.existsByItemAndProcess(item.getId(), process.getId())) {
            throw new BusinessException(ErrorCode.WORK_ORDER_PROCESS_NOT_AVAILABLE);
        }
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
