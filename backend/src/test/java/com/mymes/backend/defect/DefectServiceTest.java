package com.mymes.backend.defect;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.defect.dto.DefectActionUpdateRequest;
import com.mymes.backend.defect.dto.DefectCreateRequest;
import com.mymes.backend.defect.dto.DefectResponse;
import com.mymes.backend.defect.entity.DefectAction;
import com.mymes.backend.defect.entity.DefectRecord;
import com.mymes.backend.defect.mapper.DefectMapper;
import com.mymes.backend.defect.repository.DefectRepository;
import com.mymes.backend.defect.service.DefectService;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.production.service.ProductionService;
import com.mymes.backend.quality.entity.QualityInspection;
import com.mymes.backend.quality.entity.QualityInspectionResult;
import com.mymes.backend.quality.entity.QualityInspectionStatus;
import com.mymes.backend.quality.entity.QualityInspectionType;
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
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DefectServiceTest {

    @InjectMocks
    private DefectService defectService;

    @Mock
    private DefectRepository defectRepository;

    @Mock
    private WorkOrderService workOrderService;

    @Mock
    private ProductionService productionService;

    @Mock
    private QualityInspectionService qualityInspectionService;

    @Mock
    private DefectMapper defectMapper;

    private Item item;
    private MfgProcess process;
    private WorkOrder workOrder;
    private QualityInspection inspection;
    private DefectRecord defect;
    private DefectResponse response;

    @BeforeEach
    void setUp() {
        item = createItem(1L);
        process = createProcess(10L);
        workOrder = createWorkOrder(100L, item, process);
        inspection = createInspection(200L, item, process, workOrder);
        defect = createDefect(1L, workOrder, inspection);
        response = DefectResponse.builder()
                .id(1L)
                .workOrderId(100L)
                .qualityInspectionId(200L)
                .defectType("스크래치")
                .qty(3)
                .actionStatus(DefectAction.WAITING)
                .build();
    }

    @Nested
    @DisplayName("목록 조회")
    class FindAll {

        @Test
        @DisplayName("전체 불량 기록을 최신순으로 조회한다")
        void findAll_success() {
            // given
            given(defectRepository.findAllByOrderByCreatedAtDesc()).willReturn(List.of(defect));
            given(defectMapper.toResponse(defect)).willReturn(response);

            // when
            List<DefectResponse> result = defectService.findAll();

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(1L);
            verify(defectRepository, times(1)).findAllByOrderByCreatedAtDesc();
        }
    }

    @Nested
    @DisplayName("품질검사 기준 생성")
    class CreateByQualityInspection {

        @Test
        @DisplayName("품질검사에 불량 기록을 등록한다")
        void createByQualityInspection_success() {
            // given
            DefectCreateRequest request = createRequest(null);
            given(qualityInspectionService.getQualityInspection(200L)).willReturn(inspection);
            given(defectRepository.save(any(DefectRecord.class)))
                    .willAnswer(invocation -> invocation.getArgument(0));
            given(defectMapper.toResponse(any(DefectRecord.class))).willReturn(response);

            // when
            DefectResponse result = defectService.createByQualityInspection(200L, request);

            // then
            assertThat(result.getQualityInspectionId()).isEqualTo(200L);
            verify(defectRepository, times(1)).save(any(DefectRecord.class));
        }
    }

    @Nested
    @DisplayName("작업지시 기준 생성")
    class CreateByWorkOrder {

        @Test
        @DisplayName("작업지시와 품질검사의 작업지시가 다르면 예외가 발생한다")
        void create_qualityInspectionWorkOrderMismatch_throwsException() {
            // given
            WorkOrder otherWorkOrder = createWorkOrder(101L, item, process);
            QualityInspection otherInspection = createInspection(201L, item, process, otherWorkOrder);
            DefectCreateRequest request = createRequest(201L);
            given(workOrderService.getWorkOrder(100L)).willReturn(workOrder);
            given(qualityInspectionService.getQualityInspection(201L)).willReturn(otherInspection);

            // when & then
            assertThatThrownBy(() -> defectService.create(100L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DEFECT_QUALITY_INSPECTION_WORK_ORDER_MISMATCH);
            verify(defectRepository, never()).save(any(DefectRecord.class));
        }
    }

    @Nested
    @DisplayName("조치 수정")
    class UpdateAction {

        @Test
        @DisplayName("불량 조치 정보와 처리방식을 수정한다")
        void updateAction_success() {
            // given
            DefectActionUpdateRequest request = new DefectActionUpdateRequest();
            ReflectionTestUtils.setField(request, "actionStatus", DefectAction.COMPLETED);
            ReflectionTestUtils.setField(request, "actionMemo", "재작업 완료");
            ReflectionTestUtils.setField(request, "disposition", "REWORK");
            ReflectionTestUtils.setField(request, "assigneeName", "김품질");
            given(defectRepository.findById(1L)).willReturn(Optional.of(defect));
            given(defectMapper.toResponse(defect)).willReturn(response);

            // when
            DefectResponse result = defectService.updateAction(1L, request);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(defect.getActionStatus()).isEqualTo(DefectAction.COMPLETED);
            assertThat(defect.getActionMemo()).isEqualTo("재작업 완료");
            assertThat(defect.getDisposition()).isEqualTo("REWORK");
            assertThat(defect.getAssigneeName()).isEqualTo("김품질");
        }
    }

    private DefectCreateRequest createRequest(Long qualityInspectionId) {
        DefectCreateRequest request = new DefectCreateRequest();
        ReflectionTestUtils.setField(request, "qualityInspectionId", qualityInspectionId);
        ReflectionTestUtils.setField(request, "defectType", "스크래치");
        ReflectionTestUtils.setField(request, "qty", 3);
        ReflectionTestUtils.setField(request, "defectDescription", "외관 스크래치");
        ReflectionTestUtils.setField(request, "causeCategory", "공정");
        ReflectionTestUtils.setField(request, "causeMemo", "작업 중 접촉 발생");
        ReflectionTestUtils.setField(request, "disposition", "REWORK");
        ReflectionTestUtils.setField(request, "assigneeName", "김품질");
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
                .result(QualityInspectionResult.FAIL)
                .item(item)
                .process(process)
                .workOrder(workOrder)
                .inspectionQty(100)
                .passQty(97)
                .defectQty(3)
                .build();
        ReflectionTestUtils.setField(created, "id", id);
        return created;
    }

    private DefectRecord createDefect(Long id, WorkOrder workOrder, QualityInspection inspection) {
        DefectRecord created = DefectRecord.builder()
                .workOrder(workOrder)
                .qualityInspection(inspection)
                .defectType("스크래치")
                .qty(3)
                .defectDescription("외관 스크래치")
                .causeCategory("공정")
                .causeMemo("작업 중 접촉 발생")
                .build();
        ReflectionTestUtils.setField(created, "id", id);
        return created;
    }
}
