package com.mymes.backend.workorder;

import com.mymes.backend.bom.service.BomVersionService;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.equipment.entity.Equipment;
import com.mymes.backend.equipment.service.EquipmentService;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.itemprocess.entity.ItemProcess;
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
import com.mymes.backend.workorder.service.WorkOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WorkOrderServiceTest {

    @InjectMocks
    private WorkOrderService workOrderService;

    @Mock
    private WorkOrderRepository workOrderRepository;

    @Mock
    private ItemService itemService;

    @Mock
    private MfgProcessService processService;

    @Mock
    private WorkOrderMapper workOrderMapper;

    @Mock
    private BomVersionService bomVersionService;

    @Mock
    private EquipmentService equipmentService;

    @Mock
    private ProcessEquipmentService processEquipmentService;

    @Mock
    private ItemProcessService itemProcessService;

    private Item item;
    private MfgProcess process;
    private Equipment equipment;
    private WorkOrder workOrder;
    private WorkOrderResponse workOrderResponse;

    @BeforeEach
    void setUp() {
        item = createItem(1L);
        process = createProcess(10L);
        equipment = createEquipment(20L);
        workOrder = createWorkOrder(1L, process, equipment);
        workOrderResponse = createResponse(1L, process, equipment);
    }

    @Nested
    @DisplayName("목록 조회")
    class FindAll {

        @Test
        @DisplayName("납기일 기준으로 전체 작업지시를 조회한다")
        void findAll_success() {
            // given
            given(workOrderRepository.findAllByOrderByDueDateAsc()).willReturn(List.of(workOrder));
            given(workOrderMapper.toResponse(workOrder)).willReturn(workOrderResponse);

            // when
            List<WorkOrderResponse> result = workOrderService.findAll();

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getEquipmentId()).isEqualTo(20L);
            verify(workOrderRepository, times(1)).findAllByOrderByDueDateAsc();
            verify(workOrderMapper, times(1)).toResponse(workOrder);
        }
    }

    @Nested
    @DisplayName("상태별 조회")
    class FindByStatus {

        @Test
        @DisplayName("상태별 작업지시를 조회한다")
        void findByStatus_success() {
            // given
            given(workOrderRepository.findByStatusOrderByDueDateAsc(WorkOrderStatus.WAITING))
                    .willReturn(List.of(workOrder));
            given(workOrderMapper.toResponse(workOrder)).willReturn(workOrderResponse);

            // when
            List<WorkOrderResponse> result = workOrderService.findByStatus(WorkOrderStatus.WAITING);

            // then
            assertThat(result).hasSize(1);
            verify(workOrderRepository, times(1)).findByStatusOrderByDueDateAsc(WorkOrderStatus.WAITING);
        }
    }

    @Nested
    @DisplayName("단건 조회")
    class FindById {

        @Test
        @DisplayName("정상적으로 작업지시를 조회한다")
        void findById_success() {
            // given
            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));
            given(workOrderMapper.toResponse(workOrder)).willReturn(workOrderResponse);

            // when
            WorkOrderResponse result = workOrderService.findById(1L);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            verify(workOrderRepository, times(1)).findById(1L);
            verify(workOrderMapper, times(1)).toResponse(workOrder);
        }

        @Test
        @DisplayName("존재하지 않는 ID로 조회 시 예외가 발생한다")
        void findById_notFound() {
            // given
            given(workOrderRepository.findById(99L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> workOrderService.findById(99L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_NOT_FOUND);
            verify(workOrderRepository, times(1)).findById(99L);
        }
    }

    @Nested
    @DisplayName("생성")
    class Create {

        @Test
        @DisplayName("해당 공정에 등록된 설비로 작업지시를 생성한다")
        void create_withEquipment_success() {
            // given
            WorkOrderCreateRequest request = createRequest(1L, 10L, 20L);
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(equipmentService.getEquipment(20L)).willReturn(equipment);
            given(processEquipmentService.existsByProcessAndEquipment(10L, 20L)).willReturn(true);
            given(bomVersionService.findActiveVersion(1L)).willReturn(Optional.empty());
            given(workOrderRepository.findLatestWorkOrderNoByPrefix(anyString())).willReturn(Optional.empty());
            given(workOrderRepository.saveAndFlush(any(WorkOrder.class)))
                    .willAnswer(invocation -> invocation.getArgument(0));
            given(workOrderMapper.toResponse(any(WorkOrder.class))).willReturn(workOrderResponse);

            // when
            WorkOrderResponse result = workOrderService.create(request);

            // then
            assertThat(result.getEquipmentId()).isEqualTo(20L);
            verify(processEquipmentService, times(1)).existsByProcessAndEquipment(10L, 20L);
            verify(workOrderRepository, times(1)).saveAndFlush(any(WorkOrder.class));
        }

        @Test
        @DisplayName("설비가 있는데 공정이 없으면 예외가 발생한다")
        void create_equipmentWithoutProcess_throwsException() {
            // given
            WorkOrderCreateRequest request = createRequest(1L, null, 20L);
            given(itemService.getItem(1L)).willReturn(item);

            // when & then
            assertThatThrownBy(() -> workOrderService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_PROCESS_REQUIRED_FOR_EQUIPMENT);
            verify(equipmentService, never()).getEquipment(20L);
            verify(workOrderRepository, never()).saveAndFlush(any(WorkOrder.class));
        }

        @Test
        @DisplayName("해당 공정에 등록되지 않은 설비면 예외가 발생한다")
        void create_unavailableEquipment_throwsException() {
            // given
            WorkOrderCreateRequest request = createRequest(1L, 10L, 20L);
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(equipmentService.getEquipment(20L)).willReturn(equipment);
            given(processEquipmentService.existsByProcessAndEquipment(10L, 20L)).willReturn(false);

            // when & then
            assertThatThrownBy(() -> workOrderService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_EQUIPMENT_NOT_AVAILABLE);
            verify(workOrderRepository, never()).saveAndFlush(any(WorkOrder.class));
        }
    }

    @Nested
    @DisplayName("수정")
    class Update {

        @Test
        @DisplayName("대기 상태 작업지시의 설비 배정을 수정한다")
        void update_withEquipment_success() {
            // given
            WorkOrderUpdateRequest request = updateRequest(1L, 10L, 20L);
            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(equipmentService.getEquipment(20L)).willReturn(equipment);
            given(processEquipmentService.existsByProcessAndEquipment(10L, 20L)).willReturn(true);
            given(workOrderMapper.toResponse(workOrder)).willReturn(workOrderResponse);

            // when
            WorkOrderResponse result = workOrderService.update(1L, request);

            // then
            assertThat(result.getEquipmentId()).isEqualTo(20L);
            assertThat(workOrder.getEquipment()).isEqualTo(equipment);
            verify(processEquipmentService, times(1)).existsByProcessAndEquipment(10L, 20L);
            verify(workOrderMapper, times(1)).toResponse(workOrder);
        }

        @Test
        @DisplayName("대기 상태가 아닌 작업지시는 수정할 수 없다")
        void update_notWaiting_throwsException() {
            // given
            WorkOrderUpdateRequest request = updateRequest(1L, 10L, 20L);
            workOrder.changeStatus(WorkOrderStatus.IN_PROGRESS);
            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));

            // when & then
            assertThatThrownBy(() -> workOrderService.update(1L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_NOT_MODIFIABLE);
            verify(itemService, never()).getItem(1L);
        }

        @Test
        @DisplayName("존재하지 않는 작업지시 수정 시 예외가 발생한다")
        void update_notFound() {
            // given
            WorkOrderUpdateRequest request = updateRequest(1L, 10L, 20L);
            given(workOrderRepository.findById(99L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> workOrderService.update(99L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("상태 변경")
    class ChangeStatus {

        @Test
        @DisplayName("대기 상태 작업지시를 진행 상태로 변경한다")
        void changeStatus_success() {
            // given
            WorkOrderResponse inProgressResponse = createResponse(1L, process, equipment);
            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));
            given(workOrderMapper.toResponse(workOrder)).willReturn(inProgressResponse);

            // when
            WorkOrderResponse result = workOrderService.changeStatus(1L, WorkOrderStatus.IN_PROGRESS);

            // then
            assertThat(result).isNotNull();
            assertThat(workOrder.getStatus()).isEqualTo(WorkOrderStatus.IN_PROGRESS);
            verify(workOrderRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("유효하지 않은 상태 전이는 예외가 발생한다")
        void changeStatus_invalidTransition() {
            // given
            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));

            // when & then
            assertThatThrownBy(() -> workOrderService.changeStatus(1L, WorkOrderStatus.COMPLETED))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_INVALID_STATUS_TRANSITION);
        }
    }

    @Nested
    @DisplayName("삭제")
    class Delete {

        @Test
        @DisplayName("대기 상태 작업지시를 소프트 삭제한다")
        void delete_success() {
            // given
            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));

            // when
            workOrderService.delete(1L);

            // then
            assertThat(workOrder.isDeleted()).isTrue();
            verify(workOrderRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("대기 상태가 아닌 작업지시는 삭제할 수 없다")
        void delete_notWaiting_throwsException() {
            // given
            workOrder.changeStatus(WorkOrderStatus.IN_PROGRESS);
            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));

            // when & then
            assertThatThrownBy(() -> workOrderService.delete(1L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_NOT_DELETABLE);
        }
    }

    @Nested
    @DisplayName("생산계획 발행 작업지시 생성")
    class CreateForPlan {

        @Test
        @DisplayName("품목의 첫 번째 공정을 작업지시에 자동 연결한다")
        void createForPlan_assignsFirstProcess() {
            // given
            ItemProcess itemProcess = ItemProcess.builder()
                    .item(item)
                    .process(process)
                    .sequence(1)
                    .build();
            given(bomVersionService.findActiveVersion(1L)).willReturn(Optional.empty());
            given(itemProcessService.findFirstByItemId(1L)).willReturn(Optional.of(itemProcess));
            given(workOrderRepository.findLatestWorkOrderNoByPrefix(anyString())).willReturn(Optional.empty());
            given(workOrderRepository.saveAndFlush(any(WorkOrder.class)))
                    .willAnswer(invocation -> invocation.getArgument(0));

            // when
            WorkOrder result = workOrderService.createForPlan(item, 100, LocalDate.of(2026, 5, 5));

            // then
            assertThat(result.getProcess()).isEqualTo(process);
            assertThat(result.getEquipment()).isNull();
            verify(itemProcessService, times(1)).findFirstByItemId(1L);
            verify(workOrderRepository, times(1)).saveAndFlush(any(WorkOrder.class));
        }

        @Test
        @DisplayName("품목 공정이 없으면 공정 없이 작업지시를 생성한다")
        void createForPlan_withoutItemProcess_success() {
            // given
            given(bomVersionService.findActiveVersion(1L)).willReturn(Optional.empty());
            given(itemProcessService.findFirstByItemId(1L)).willReturn(Optional.empty());
            given(workOrderRepository.findLatestWorkOrderNoByPrefix(anyString())).willReturn(Optional.empty());
            given(workOrderRepository.saveAndFlush(any(WorkOrder.class)))
                    .willAnswer(invocation -> invocation.getArgument(0));

            // when
            WorkOrder result = workOrderService.createForPlan(item, 100, LocalDate.of(2026, 5, 5));

            // then
            assertThat(result.getProcess()).isNull();
            verify(itemProcessService, times(1)).findFirstByItemId(1L);
        }
    }

    @Nested
    @DisplayName("엔티티 조회")
    class GetWorkOrder {

        @Test
        @DisplayName("ID로 작업지시 엔티티를 조회한다")
        void getWorkOrder_success() {
            // given
            given(workOrderRepository.findById(1L)).willReturn(Optional.of(workOrder));

            // when
            WorkOrder result = workOrderService.getWorkOrder(1L);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            verify(workOrderRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("존재하지 않는 ID로 엔티티 조회 시 예외가 발생한다")
        void getWorkOrder_notFound() {
            // given
            given(workOrderRepository.findById(99L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> workOrderService.getWorkOrder(99L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WORK_ORDER_NOT_FOUND);
        }
    }

    private WorkOrderCreateRequest createRequest(Long itemId, Long processId, Long equipmentId) {
        WorkOrderCreateRequest request = new WorkOrderCreateRequest();
        ReflectionTestUtils.setField(request, "itemId", itemId);
        ReflectionTestUtils.setField(request, "plannedQty", 100);
        ReflectionTestUtils.setField(request, "priority", Priority.MEDIUM);
        ReflectionTestUtils.setField(request, "processId", processId);
        ReflectionTestUtils.setField(request, "equipmentId", equipmentId);
        ReflectionTestUtils.setField(request, "workerName", "Kim");
        ReflectionTestUtils.setField(request, "dueDate", LocalDate.of(2026, 5, 5));
        return request;
    }

    private WorkOrderUpdateRequest updateRequest(Long itemId, Long processId, Long equipmentId) {
        WorkOrderUpdateRequest request = new WorkOrderUpdateRequest();
        ReflectionTestUtils.setField(request, "itemId", itemId);
        ReflectionTestUtils.setField(request, "plannedQty", 120);
        ReflectionTestUtils.setField(request, "priority", Priority.HIGH);
        ReflectionTestUtils.setField(request, "processId", processId);
        ReflectionTestUtils.setField(request, "equipmentId", equipmentId);
        ReflectionTestUtils.setField(request, "workerName", "Lee");
        ReflectionTestUtils.setField(request, "dueDate", LocalDate.of(2026, 5, 6));
        return request;
    }

    private Item createItem(Long id) {
        Item created = Item.builder()
                .itemCode("ITEM-000001")
                .itemName("테스트 품목")
                .unit("EA")
                .build();
        ReflectionTestUtils.setField(created, "id", id);
        return created;
    }

    private MfgProcess createProcess(Long id) {
        MfgProcess created = MfgProcess.builder()
                .processCode("PROC-000001")
                .processName("테스트 공정")
                .build();
        ReflectionTestUtils.setField(created, "id", id);
        return created;
    }

    private Equipment createEquipment(Long id) {
        Equipment created = Equipment.builder()
                .equipmentCode("EQ-000001")
                .equipmentName("테스트 설비")
                .build();
        ReflectionTestUtils.setField(created, "id", id);
        return created;
    }

    private WorkOrder createWorkOrder(Long id, MfgProcess process, Equipment equipment) {
        WorkOrder created = WorkOrder.builder()
                .workOrderNo("WO-20260505-0001")
                .item(item)
                .plannedQty(100)
                .priority(Priority.MEDIUM)
                .process(process)
                .equipment(equipment)
                .workerName("Kim")
                .dueDate(LocalDate.of(2026, 5, 5))
                .build();
        ReflectionTestUtils.setField(created, "id", id);
        return created;
    }

    private WorkOrderResponse createResponse(Long id, MfgProcess process, Equipment equipment) {
        return WorkOrderResponse.builder()
                .id(id)
                .workOrderNo("WO-20260505-0001")
                .itemId(1L)
                .itemCode("ITEM-000001")
                .itemName("테스트 품목")
                .plannedQty(100)
                .priority(Priority.MEDIUM)
                .status(WorkOrderStatus.WAITING)
                .processId(process != null ? process.getId() : null)
                .processCode(process != null ? process.getProcessCode() : null)
                .processName(process != null ? process.getProcessName() : null)
                .equipmentId(equipment != null ? equipment.getId() : null)
                .equipmentCode(equipment != null ? equipment.getEquipmentCode() : null)
                .equipmentName(equipment != null ? equipment.getEquipmentName() : null)
                .workerName("Kim")
                .dueDate(LocalDate.of(2026, 5, 5))
                .build();
    }
}
