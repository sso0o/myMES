package com.mymes.backend.workorder.service;

import com.mymes.backend.bom.entity.BomVersion;
import com.mymes.backend.bom.service.BomVersionService;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.equipment.entity.Equipment;
import com.mymes.backend.equipment.service.EquipmentService;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.itemprocess.service.ItemProcessService;
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
     * 전체 작업지시 목록을 납기일 오름차순으로 조회합니다.
     *
     * @return 작업지시 응답 목록
     */
    public List<WorkOrderResponse> findAll() {
        return workOrderRepository.findAllByOrderByDueDateAsc().stream()
                .map(workOrderMapper::toResponse)
                .toList();
    }

    /**
     * 상태별 작업지시 목록을 납기일 오름차순으로 조회합니다.
     *
     * @param status 작업지시 상태
     * @return 작업지시 응답 목록
     */
    public List<WorkOrderResponse> findByStatus(WorkOrderStatus status) {
        return workOrderRepository.findByStatusOrderByDueDateAsc(status).stream()
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
                process, equipment, request.getWorkerName(), request.getDueDate());
        log.info("작업지시 수정 완료: id={}", id);
        return workOrderMapper.toResponse(workOrder);
    }

    /**
     * 작업지시 상태를 다음 단계로 변경합니다.
     *
     * @param id 작업지시 ID
     * @param newStatus 변경할 상태
     * @return 상태가 변경된 작업지시 응답 DTO
     */
    @Transactional
    public WorkOrderResponse changeStatus(Long id, WorkOrderStatus newStatus) {
        WorkOrder workOrder = getWorkOrder(id);
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
     * 생산계획 발행 시 작업지시를 생성합니다.
     * 품목의 첫 번째 공정이 있으면 작업지시에 함께 연결합니다.
     *
     * @param item 품목
     * @param plannedQty 계획 수량
     * @param plannedDate 계획 일자
     * @return 생성된 작업지시 엔티티
     */
    @Transactional
    public WorkOrder createForPlan(Item item, Integer plannedQty, LocalDate plannedDate) {
        BomVersion bomVersion = bomVersionService.findActiveVersion(item.getId()).orElse(null);
        MfgProcess firstProcess = itemProcessService.findFirstByItemId(item.getId())
                .map(itemProcess -> itemProcess.getProcess())
                .orElse(null);

        for (int attempt = 1; attempt <= MAX_WORK_ORDER_NO_RETRIES; attempt++) {
            String workOrderNo = generateWorkOrderNo();
            WorkOrder workOrder = WorkOrder.builder()
                    .workOrderNo(workOrderNo)
                    .item(item)
                    .plannedQty(plannedQty)
                    .priority(Priority.MEDIUM)
                    .process(firstProcess)
                    .dueDate(plannedDate)
                    .bomVersion(bomVersion)
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
