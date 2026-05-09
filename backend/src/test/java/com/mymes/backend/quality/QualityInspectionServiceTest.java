package com.mymes.backend.quality;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.service.MfgProcessService;
import com.mymes.backend.quality.dto.request.QualityInspectionCreateRequest;
import com.mymes.backend.quality.dto.request.QualityInspectionUpdateRequest;
import com.mymes.backend.quality.dto.response.QualityInspectionResponse;
import com.mymes.backend.quality.entity.QualityInspection;
import com.mymes.backend.quality.entity.QualityInspectionResult;
import com.mymes.backend.quality.entity.QualityInspectionStatus;
import com.mymes.backend.quality.entity.QualityInspectionType;
import com.mymes.backend.quality.mapper.QualityInspectionMapper;
import com.mymes.backend.quality.repository.QualityInspectionRepository;
import com.mymes.backend.quality.service.QualityInspectionService;
import com.mymes.backend.workorder.entity.Priority;
import com.mymes.backend.workorder.entity.WorkOrder;
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
class QualityInspectionServiceTest {

    @InjectMocks
    private QualityInspectionService qualityInspectionService;

    @Mock
    private QualityInspectionRepository qualityInspectionRepository;

    @Mock
    private QualityInspectionMapper qualityInspectionMapper;

    @Mock
    private ItemService itemService;

    @Mock
    private MfgProcessService processService;

    @Mock
    private WorkOrderService workOrderService;

    private Item item;
    private MfgProcess process;
    private WorkOrder workOrder;
    private QualityInspection inspection;
    private QualityInspectionResponse response;

    @BeforeEach
    void setUp() {
        item = createItem(1L);
        process = createProcess(10L);
        workOrder = createWorkOrder(100L, item, process);
        inspection = createInspection(1L, item, process, workOrder);
        response = createResponse(1L);
    }

    @Nested
    @DisplayName("목록 조회")
    class FindAll {

        @Test
        @DisplayName("검사일자 기준으로 전체 품질검사를 조회한다")
        void findAll_success() {
            // given
            given(qualityInspectionRepository.findAllByOrderByInspectionDateDescIdDesc())
                    .willReturn(List.of(inspection));
            given(qualityInspectionMapper.toResponse(inspection)).willReturn(response);

            // when
            List<QualityInspectionResponse> result = qualityInspectionService.findAll();

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(1L);
            verify(qualityInspectionRepository, times(1)).findAllByOrderByInspectionDateDescIdDesc();
        }
    }

    @Nested
    @DisplayName("상태별 조회")
    class FindByStatus {

        @Test
        @DisplayName("상태별 품질검사를 조회한다")
        void findByStatus_success() {
            // given
            given(qualityInspectionRepository.findByStatusOrderByInspectionDateDescIdDesc(QualityInspectionStatus.WAITING))
                    .willReturn(List.of(inspection));
            given(qualityInspectionMapper.toResponse(inspection)).willReturn(response);

            // when
            List<QualityInspectionResponse> result = qualityInspectionService.findByStatus(QualityInspectionStatus.WAITING);

            // then
            assertThat(result).hasSize(1);
            verify(qualityInspectionRepository, times(1))
                    .findByStatusOrderByInspectionDateDescIdDesc(QualityInspectionStatus.WAITING);
        }
    }

    @Nested
    @DisplayName("단건 조회")
    class FindById {

        @Test
        @DisplayName("정상적으로 품질검사를 조회한다")
        void findById_success() {
            // given
            given(qualityInspectionRepository.findById(1L)).willReturn(Optional.of(inspection));
            given(qualityInspectionMapper.toResponse(inspection)).willReturn(response);

            // when
            QualityInspectionResponse result = qualityInspectionService.findById(1L);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            verify(qualityInspectionRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("존재하지 않는 ID로 조회 시 예외가 발생한다")
        void findById_notFound() {
            // given
            given(qualityInspectionRepository.findById(99L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> qualityInspectionService.findById(99L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.QUALITY_INSPECTION_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("생성")
    class Create {

        @Test
        @DisplayName("작업지시와 연결된 품질검사를 등록한다")
        void create_success() {
            // given
            QualityInspectionCreateRequest request = createRequest(80, 20);
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(workOrderService.getWorkOrder(100L)).willReturn(workOrder);
            given(qualityInspectionRepository.findLatestInspectionNoByPrefix(anyString())).willReturn(Optional.empty());
            given(qualityInspectionRepository.saveAndFlush(any(QualityInspection.class)))
                    .willAnswer(invocation -> invocation.getArgument(0));
            given(qualityInspectionMapper.toResponse(any(QualityInspection.class))).willReturn(response);

            // when
            QualityInspectionResponse result = qualityInspectionService.create(request);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            verify(qualityInspectionRepository, times(1)).saveAndFlush(any(QualityInspection.class));
        }

        @Test
        @DisplayName("합격수량과 불량수량 합계가 검사수량을 초과하면 예외가 발생한다")
        void create_invalidQty_throwsException() {
            // given
            QualityInspectionCreateRequest request = createRequest(90, 20);

            // when & then
            assertThatThrownBy(() -> qualityInspectionService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.QUALITY_INSPECTION_QTY_INVALID);
            verify(qualityInspectionRepository, never()).saveAndFlush(any(QualityInspection.class));
        }

        @Test
        @DisplayName("작업지시의 품목과 요청 품목이 다르면 예외가 발생한다")
        void create_workOrderItemMismatch_throwsException() {
            // given
            Item otherItem = createItem(2L);
            QualityInspectionCreateRequest request = createRequest(80, 20);
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(workOrderService.getWorkOrder(100L)).willReturn(createWorkOrder(100L, otherItem, process));

            // when & then
            assertThatThrownBy(() -> qualityInspectionService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.QUALITY_INSPECTION_WORK_ORDER_ITEM_MISMATCH);
            verify(qualityInspectionRepository, never()).saveAndFlush(any(QualityInspection.class));
        }
    }

    @Nested
    @DisplayName("수정")
    class Update {

        @Test
        @DisplayName("품질검사를 수정한다")
        void update_success() {
            // given
            QualityInspectionUpdateRequest request = updateRequest();
            given(qualityInspectionRepository.findById(1L)).willReturn(Optional.of(inspection));
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(workOrderService.getWorkOrder(100L)).willReturn(workOrder);
            given(qualityInspectionMapper.toResponse(inspection)).willReturn(response);

            // when
            QualityInspectionResponse result = qualityInspectionService.update(1L, request);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            verify(qualityInspectionMapper, times(1)).toResponse(inspection);
        }
    }

    @Nested
    @DisplayName("삭제")
    class Delete {

        @Test
        @DisplayName("품질검사를 소프트 삭제한다")
        void delete_success() {
            // given
            given(qualityInspectionRepository.findById(1L)).willReturn(Optional.of(inspection));

            // when
            qualityInspectionService.delete(1L);

            // then
            assertThat(inspection.getDeletedAt()).isNotNull();
            verify(qualityInspectionRepository, times(1)).findById(1L);
        }
    }

    private QualityInspectionCreateRequest createRequest(int passQty, int defectQty) {
        return QualityInspectionCreateRequest.builder()
                .inspectionDate(LocalDate.of(2026, 5, 5))
                .inspectionType(QualityInspectionType.IN_PROCESS)
                .status(QualityInspectionStatus.COMPLETED)
                .result(QualityInspectionResult.PASS)
                .itemId(1L)
                .processId(10L)
                .workOrderId(100L)
                .inspectionQty(100)
                .passQty(passQty)
                .defectQty(defectQty)
                .inspectorName("홍길동")
                .remarks("정상")
                .build();
    }

    private QualityInspectionUpdateRequest updateRequest() {
        return QualityInspectionUpdateRequest.builder()
                .inspectionDate(LocalDate.of(2026, 5, 6))
                .inspectionType(QualityInspectionType.FINAL)
                .status(QualityInspectionStatus.COMPLETED)
                .result(QualityInspectionResult.HOLD)
                .itemId(1L)
                .processId(10L)
                .workOrderId(100L)
                .inspectionQty(100)
                .passQty(95)
                .defectQty(5)
                .inspectorName("김검사")
                .remarks("보류")
                .build();
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
                .processName("조립")
                .build();
        ReflectionTestUtils.setField(created, "id", id);
        return created;
    }

    private WorkOrder createWorkOrder(Long id, Item item, MfgProcess process) {
        WorkOrder created = WorkOrder.builder()
                .workOrderNo("WO-20260505-0001")
                .item(item)
                .plannedQty(100)
                .priority(Priority.MEDIUM)
                .process(process)
                .productionDate(LocalDate.of(2026, 5, 5))
                .dueDate(LocalDate.of(2026, 5, 10))
                .build();
        ReflectionTestUtils.setField(created, "id", id);
        return created;
    }

    private QualityInspection createInspection(Long id, Item item, MfgProcess process, WorkOrder workOrder) {
        QualityInspection created = QualityInspection.builder()
                .inspectionNo("QI-20260505-0001")
                .inspectionDate(LocalDate.of(2026, 5, 5))
                .inspectionType(QualityInspectionType.IN_PROCESS)
                .status(QualityInspectionStatus.COMPLETED)
                .result(QualityInspectionResult.PASS)
                .item(item)
                .process(process)
                .workOrder(workOrder)
                .inspectionQty(100)
                .passQty(98)
                .defectQty(2)
                .build();
        ReflectionTestUtils.setField(created, "id", id);
        return created;
    }

    private QualityInspectionResponse createResponse(Long id) {
        return QualityInspectionResponse.builder()
                .id(id)
                .inspectionNo("QI-20260505-0001")
                .inspectionDate(LocalDate.of(2026, 5, 5))
                .inspectionType(QualityInspectionType.IN_PROCESS)
                .status(QualityInspectionStatus.COMPLETED)
                .result(QualityInspectionResult.PASS)
                .itemId(1L)
                .processId(10L)
                .workOrderId(100L)
                .inspectionQty(100)
                .passQty(98)
                .defectQty(2)
                .build();
    }
}
