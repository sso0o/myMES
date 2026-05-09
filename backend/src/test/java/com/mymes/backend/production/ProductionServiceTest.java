package com.mymes.backend.production;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.production.dto.ProductionCreateRequest;
import com.mymes.backend.production.dto.ProductionResponse;
import com.mymes.backend.production.dto.ProductionUpdateRequest;
import com.mymes.backend.production.entity.ProductionRecord;
import com.mymes.backend.production.mapper.ProductionMapper;
import com.mymes.backend.production.repository.ProductionRepository;
import com.mymes.backend.production.service.ProductionService;
import com.mymes.backend.workorder.entity.Priority;
import com.mymes.backend.workorder.entity.WorkOrder;
import com.mymes.backend.workorder.entity.WorkOrderStatus;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProductionServiceTest {

    @InjectMocks
    private ProductionService productionService;

    @Mock
    private ProductionRepository productionRepository;

    @Mock
    private WorkOrderService workOrderService;

    @Mock
    private ProductionMapper productionMapper;

    private Item item;
    private MfgProcess process;
    private WorkOrder waitingWorkOrder;
    private WorkOrder inProgressWorkOrder;
    private ProductionRecord record;
    private ProductionResponse response;

    @BeforeEach
    void setUp() {
        item = createItem(1L);
        process = createProcess(10L);
        waitingWorkOrder = createWorkOrder(1L, WorkOrderStatus.WAITING);
        inProgressWorkOrder = createWorkOrder(2L, WorkOrderStatus.IN_PROGRESS);
        record = createRecord(100L, inProgressWorkOrder, process, 50, 45, 3);
        response = createResponse(100L, 2L, 10L, 50, 45, 3);
    }

    @Nested
    @DisplayName("작업지시별 목록 조회")
    class FindByWorkOrder {

        @Test
        @DisplayName("작업지시 ID로 생산실적 목록을 조회한다")
        void findByWorkOrder_success() {
            // given
            given(productionRepository.findByWorkOrderIdOrderByCreatedAtAsc(2L))
                    .willReturn(List.of(record));
            given(productionMapper.toResponse(record)).willReturn(response);

            // when
            List<ProductionResponse> result = productionService.findByWorkOrder(2L);

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(100L);
            verify(productionRepository, times(1)).findByWorkOrderIdOrderByCreatedAtAsc(2L);
        }

        @Test
        @DisplayName("생산실적이 없으면 빈 목록을 반환한다")
        void findByWorkOrder_empty() {
            // given
            given(productionRepository.findByWorkOrderIdOrderByCreatedAtAsc(99L))
                    .willReturn(List.of());

            // when
            List<ProductionResponse> result = productionService.findByWorkOrder(99L);

            // then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("단건 조회")
    class FindById {

        @Test
        @DisplayName("ID로 생산실적을 조회한다")
        void findById_success() {
            // given
            given(productionRepository.findById(100L)).willReturn(Optional.of(record));
            given(productionMapper.toResponse(record)).willReturn(response);

            // when
            ProductionResponse result = productionService.findById(100L);

            // then
            assertThat(result.getId()).isEqualTo(100L);
            verify(productionRepository, times(1)).findById(100L);
        }

        @Test
        @DisplayName("존재하지 않는 ID로 조회 시 예외가 발생한다")
        void findById_notFound() {
            // given
            given(productionRepository.findById(999L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> productionService.findById(999L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PRODUCTION_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("생성")
    class Create {

        @Test
        @DisplayName("진행 중인 작업지시에 생산실적을 등록한다")
        void create_success() {
            // given
            ProductionCreateRequest request = createRequest(10L, 50, 45, null);
            given(workOrderService.getWorkOrder(2L)).willReturn(inProgressWorkOrder);
            given(productionRepository.save(any(ProductionRecord.class))).willReturn(record);
            given(productionMapper.toResponse(record)).willReturn(response);

            // when
            ProductionResponse result = productionService.create(2L, request);

            // then
            assertThat(result.getId()).isEqualTo(100L);
            verify(productionRepository, times(1)).save(any(ProductionRecord.class));
        }

        @Test
        @DisplayName("불량수량 없이 생산실적을 등록하면 불량수량은 0으로 처리된다")
        void create_withNullDefectQty_defaultsToZero() {
            // given
            ProductionCreateRequest request = createRequest(10L, 50, 50, null);
            ProductionResponse zeroDefectResponse = createResponse(101L, 2L, 10L, 50, 50, 0);
            ProductionRecord zeroDefectRecord = createRecord(101L, inProgressWorkOrder, process, 50, 50, 0);

            given(workOrderService.getWorkOrder(2L)).willReturn(inProgressWorkOrder);
            given(productionRepository.save(any(ProductionRecord.class))).willReturn(zeroDefectRecord);
            given(productionMapper.toResponse(zeroDefectRecord)).willReturn(zeroDefectResponse);

            // when
            ProductionResponse result = productionService.create(2L, request);

            // then
            assertThat(result.getDefectQty()).isEqualTo(0);
        }

        @Test
        @DisplayName("진행 중이 아닌 작업지시에 생산실적 등록 시 예외가 발생한다")
        void create_workOrderNotInProgress() {
            // given
            ProductionCreateRequest request = createRequest(10L, 50, 45, 3);
            given(workOrderService.getWorkOrder(1L)).willReturn(waitingWorkOrder);

            // when & then
            assertThatThrownBy(() -> productionService.create(1L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PRODUCTION_WORK_ORDER_NOT_IN_PROGRESS);
            verify(productionRepository, never()).save(any());
        }

        @Test
        @DisplayName("양품수량 + 불량수량이 투입수량을 초과하면 예외가 발생한다")
        void create_qtyExceeded() {
            // given
            ProductionCreateRequest request = createRequest(10L, 50, 48, 5);
            given(workOrderService.getWorkOrder(2L)).willReturn(inProgressWorkOrder);

            // when & then
            assertThatThrownBy(() -> productionService.create(2L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PRODUCTION_QTY_EXCEEDED);
            verify(productionRepository, never()).save(any());
        }

        @Test
        @DisplayName("양품수량 + 불량수량이 투입수량과 같으면 정상 등록된다")
        void create_qtySumEqualToInputQty_success() {
            // given
            ProductionCreateRequest request = createRequest(10L, 50, 45, 5);
            given(workOrderService.getWorkOrder(2L)).willReturn(inProgressWorkOrder);
            given(productionRepository.save(any(ProductionRecord.class))).willReturn(record);
            given(productionMapper.toResponse(record)).willReturn(response);

            // when
            ProductionResponse result = productionService.create(2L, request);

            // then
            assertThat(result).isNotNull();
            verify(productionRepository, times(1)).save(any(ProductionRecord.class));
        }
    }

    @Nested
    @DisplayName("수정")
    class Update {

        @Test
        @DisplayName("생산실적을 정상적으로 수정한다")
        void update_success() {
            // given
            ProductionUpdateRequest request = updateRequest(10L, 60, 55, 4);
            ProductionResponse updatedResponse = createResponse(100L, 2L, 10L, 60, 55, 4);

            given(productionRepository.findById(100L)).willReturn(Optional.of(record));
            given(productionMapper.toResponse(record)).willReturn(updatedResponse);

            // when
            ProductionResponse result = productionService.update(100L, request);

            // then
            assertThat(result.getInputQty()).isEqualTo(60);
            assertThat(result.getCompletedQty()).isEqualTo(55);
            verify(productionRepository, times(1)).findById(100L);
        }

        @Test
        @DisplayName("수정 시 양품수량 + 불량수량이 투입수량을 초과하면 예외가 발생한다")
        void update_qtyExceeded() {
            // given
            ProductionUpdateRequest request = updateRequest(10L, 50, 48, 5);
            given(productionRepository.findById(100L)).willReturn(Optional.of(record));

            // when & then
            assertThatThrownBy(() -> productionService.update(100L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PRODUCTION_QTY_EXCEEDED);
        }

        @Test
        @DisplayName("존재하지 않는 생산실적 수정 시 예외가 발생한다")
        void update_notFound() {
            // given
            ProductionUpdateRequest request = updateRequest(10L, 50, 45, 3);
            given(productionRepository.findById(999L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> productionService.update(999L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PRODUCTION_NOT_FOUND);
        }
    }

    // ── 픽스처 생성 헬퍼 ─────────────────────────────────────────

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

    private WorkOrder createWorkOrder(Long id, WorkOrderStatus targetStatus) {
        WorkOrder wo = WorkOrder.builder()
                .workOrderNo("WO-20260505-000" + id)
                .item(item)
                .plannedQty(100)
                .priority(Priority.MEDIUM)
                .productionDate(LocalDate.of(2026, 5, 5))
                .dueDate(LocalDate.of(2026, 5, 5))
                .build();
        ReflectionTestUtils.setField(wo, "id", id);
        if (targetStatus == WorkOrderStatus.IN_PROGRESS) {
            wo.changeStatus(WorkOrderStatus.IN_PROGRESS);
        }
        return wo;
    }

    private ProductionRecord createRecord(Long id, WorkOrder workOrder, MfgProcess process,
                                          int inputQty, int completedQty, int defectQty) {
        ProductionRecord created = ProductionRecord.builder()
                .workOrder(workOrder)
                .process(process)
                .startedAt(LocalDateTime.of(2026, 5, 5, 8, 0))
                .endedAt(LocalDateTime.of(2026, 5, 5, 17, 0))
                .inputQty(inputQty)
                .completedQty(completedQty)
                .defectQty(defectQty)
                .build();
        ReflectionTestUtils.setField(created, "id", id);
        return created;
    }

    private ProductionResponse createResponse(Long id, Long workOrderId, Long processId,
                                              int inputQty, int completedQty, int defectQty) {
        return ProductionResponse.builder()
                .id(id)
                .workOrderId(workOrderId)
                .workOrderNo("WO-20260505-000" + workOrderId)
                .processId(processId)
                .processName("테스트 공정")
                .startedAt(LocalDateTime.of(2026, 5, 5, 8, 0))
                .endedAt(LocalDateTime.of(2026, 5, 5, 17, 0))
                .inputQty(inputQty)
                .completedQty(completedQty)
                .defectQty(defectQty)
                .build();
    }

    private ProductionCreateRequest createRequest(Long processId, int inputQty,
                                                  int completedQty, Integer defectQty) {
        ProductionCreateRequest request = new ProductionCreateRequest();
        ReflectionTestUtils.setField(request, "startedAt", LocalDateTime.of(2026, 5, 5, 8, 0));
        ReflectionTestUtils.setField(request, "endedAt", LocalDateTime.of(2026, 5, 5, 17, 0));
        ReflectionTestUtils.setField(request, "inputQty", inputQty);
        ReflectionTestUtils.setField(request, "completedQty", completedQty);
        ReflectionTestUtils.setField(request, "defectQty", defectQty);
        return request;
    }

    private ProductionUpdateRequest updateRequest(Long processId, int inputQty,
                                                  int completedQty, Integer defectQty) {
        ProductionUpdateRequest request = new ProductionUpdateRequest();
        ReflectionTestUtils.setField(request, "startedAt", LocalDateTime.of(2026, 5, 5, 8, 0));
        ReflectionTestUtils.setField(request, "endedAt", LocalDateTime.of(2026, 5, 5, 17, 0));
        ReflectionTestUtils.setField(request, "inputQty", inputQty);
        ReflectionTestUtils.setField(request, "completedQty", completedQty);
        ReflectionTestUtils.setField(request, "defectQty", defectQty);
        return request;
    }
}
