package com.mymes.backend.inspectionstandard;

import com.mymes.backend.code.entity.CodeGroup;
import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.code.repository.CodeGroupRepository;
import com.mymes.backend.code.repository.CommonCodeRepository;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.inspectionitem.entity.InspectionItem;
import com.mymes.backend.inspectionitem.entity.MeasurementType;
import com.mymes.backend.inspectionitem.service.InspectionItemService;
import com.mymes.backend.inspectionstandard.dto.InspectionStandardCreateRequest;
import com.mymes.backend.inspectionstandard.dto.InspectionStandardResponse;
import com.mymes.backend.inspectionstandard.dto.InspectionStandardUpdateRequest;
import com.mymes.backend.inspectionstandard.entity.InspectionStandard;
import com.mymes.backend.inspectionstandard.mapper.InspectionStandardMapper;
import com.mymes.backend.inspectionstandard.repository.InspectionStandardRepository;
import com.mymes.backend.inspectionstandard.service.InspectionStandardService;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.itemprocess.service.ItemProcessService;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.service.MfgProcessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
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
class InspectionStandardServiceTest {

    @InjectMocks
    private InspectionStandardService inspectionStandardService;

    @Mock
    private InspectionStandardRepository inspectionStandardRepository;

    @Mock
    private InspectionStandardMapper inspectionStandardMapper;

    @Mock
    private ItemService itemService;

    @Mock
    private MfgProcessService processService;

    @Mock
    private InspectionItemService inspectionItemService;

    @Mock
    private ItemProcessService itemProcessService;

    @Mock
    private CodeGroupRepository codeGroupRepository;

    @Mock
    private CommonCodeRepository commonCodeRepository;

    private Item item;
    private MfgProcess process;
    private InspectionItem numericInspectionItem;
    private InspectionItem passFailInspectionItem;
    private CodeGroup methodGroup;
    private CommonCode samplingMethod;
    private CommonCode fullMethod;
    private InspectionStandard inspectionStandard;
    private InspectionStandardResponse response;

    @BeforeEach
    void setUp() {
        item = createItem(1L);
        process = createProcess(10L);
        numericInspectionItem = createInspectionItem(100L, MeasurementType.NUMERIC);
        passFailInspectionItem = createInspectionItem(101L, MeasurementType.PASS_FAIL);
        methodGroup = createCodeGroup();
        samplingMethod = createCommonCode(200L, "SAMPLING", "샘플링검사");
        fullMethod = createCommonCode(201L, "FULL", "전수검사");
        inspectionStandard = createInspectionStandard(1L, numericInspectionItem, samplingMethod);
        response = InspectionStandardResponse.builder()
                .id(1L)
                .itemId(1L)
                .processId(10L)
                .inspectionItemId(100L)
                .inspectionMethodCode("SAMPLING")
                .build();
    }

    @Nested
    @DisplayName("목록 조회")
    class FindAll {

        @Test
        @DisplayName("전체 검사 기준 목록을 조회한다")
        void findAll_success() {
            // given
            given(inspectionStandardRepository.findAllByOrderByItem_ItemCodeAscProcess_ProcessCodeAscSortOrderAsc())
                    .willReturn(List.of(inspectionStandard));
            given(inspectionStandardMapper.toResponse(inspectionStandard)).willReturn(response);

            // when
            List<InspectionStandardResponse> result = inspectionStandardService.findAll(null, null);

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(1L);
            verify(inspectionStandardRepository, times(1))
                    .findAllByOrderByItem_ItemCodeAscProcess_ProcessCodeAscSortOrderAsc();
        }

        @Test
        @DisplayName("품목과 공정 기준으로 검사 기준 목록을 조회한다")
        void findAll_filterByItemAndProcess_success() {
            // given
            given(inspectionStandardRepository.findByItem_IdAndProcess_IdOrderBySortOrderAsc(1L, 10L))
                    .willReturn(List.of(inspectionStandard));
            given(inspectionStandardMapper.toResponse(inspectionStandard)).willReturn(response);

            // when
            List<InspectionStandardResponse> result = inspectionStandardService.findAll(1L, 10L);

            // then
            assertThat(result).hasSize(1);
            verify(inspectionStandardRepository, times(1))
                    .findByItem_IdAndProcess_IdOrderBySortOrderAsc(1L, 10L);
        }
    }

    @Nested
    @DisplayName("단건 조회")
    class FindById {

        @Test
        @DisplayName("정상적으로 검사 기준을 조회한다")
        void findById_success() {
            // given
            given(inspectionStandardRepository.findById(1L)).willReturn(Optional.of(inspectionStandard));
            given(inspectionStandardMapper.toResponse(inspectionStandard)).willReturn(response);

            // when
            InspectionStandardResponse result = inspectionStandardService.findById(1L);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            verify(inspectionStandardRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("존재하지 않는 ID로 조회 시 예외가 발생한다")
        void findById_notFound() {
            // given
            given(inspectionStandardRepository.findById(99L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> inspectionStandardService.findById(99L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INSPECTION_STANDARD_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("생성")
    class Create {

        @Test
        @DisplayName("샘플링 수치형 검사 기준을 생성한다")
        void create_success() {
            // given
            InspectionStandardCreateRequest request = createRequest(100L, "SAMPLING");
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(inspectionItemService.getInspectionItem(100L)).willReturn(numericInspectionItem);
            given(codeGroupRepository.findByGroupId("QC_INSPECTION_METHOD")).willReturn(Optional.of(methodGroup));
            given(commonCodeRepository.findByCodeGroupAndCode(methodGroup, "SAMPLING"))
                    .willReturn(Optional.of(samplingMethod));
            given(itemProcessService.existsByItemAndProcess(1L, 10L)).willReturn(true);
            given(inspectionStandardRepository.existsByItem_IdAndProcess_IdAndInspectionItem_Id(1L, 10L, 100L))
                    .willReturn(false);
            given(inspectionStandardRepository.save(any(InspectionStandard.class)))
                    .willAnswer(invocation -> invocation.getArgument(0));
            given(inspectionStandardMapper.toResponse(any(InspectionStandard.class))).willReturn(response);

            // when
            InspectionStandardResponse result = inspectionStandardService.create(request);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            verify(inspectionStandardRepository, times(1)).save(any(InspectionStandard.class));
        }

        @Test
        @DisplayName("품목에 등록되지 않은 공정이면 예외가 발생한다")
        void create_itemProcessNotAvailable() {
            // given
            InspectionStandardCreateRequest request = createRequest(100L, "SAMPLING");
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(inspectionItemService.getInspectionItem(100L)).willReturn(numericInspectionItem);
            given(codeGroupRepository.findByGroupId("QC_INSPECTION_METHOD")).willReturn(Optional.of(methodGroup));
            given(commonCodeRepository.findByCodeGroupAndCode(methodGroup, "SAMPLING"))
                    .willReturn(Optional.of(samplingMethod));
            given(itemProcessService.existsByItemAndProcess(1L, 10L)).willReturn(false);

            // when & then
            assertThatThrownBy(() -> inspectionStandardService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INSPECTION_STANDARD_ITEM_PROCESS_NOT_AVAILABLE);
            verify(inspectionStandardRepository, never()).save(any(InspectionStandard.class));
        }

        @Test
        @DisplayName("같은 품목/공정/검사항목이 이미 있으면 예외가 발생한다")
        void create_duplicated() {
            // given
            InspectionStandardCreateRequest request = createRequest(100L, "SAMPLING");
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(inspectionItemService.getInspectionItem(100L)).willReturn(numericInspectionItem);
            given(codeGroupRepository.findByGroupId("QC_INSPECTION_METHOD")).willReturn(Optional.of(methodGroup));
            given(commonCodeRepository.findByCodeGroupAndCode(methodGroup, "SAMPLING"))
                    .willReturn(Optional.of(samplingMethod));
            given(itemProcessService.existsByItemAndProcess(1L, 10L)).willReturn(true);
            given(inspectionStandardRepository.existsByItem_IdAndProcess_IdAndInspectionItem_Id(1L, 10L, 100L))
                    .willReturn(true);

            // when & then
            assertThatThrownBy(() -> inspectionStandardService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INSPECTION_STANDARD_DUPLICATED);
        }

        @Test
        @DisplayName("샘플링 검사방식인데 샘플수가 없으면 예외가 발생한다")
        void create_samplingWithoutSampleQty() {
            // given
            InspectionStandardCreateRequest request = createRequest(100L, "SAMPLING");
            ReflectionTestUtils.setField(request, "sampleQty", null);
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(inspectionItemService.getInspectionItem(100L)).willReturn(numericInspectionItem);
            given(codeGroupRepository.findByGroupId("QC_INSPECTION_METHOD")).willReturn(Optional.of(methodGroup));
            given(commonCodeRepository.findByCodeGroupAndCode(methodGroup, "SAMPLING"))
                    .willReturn(Optional.of(samplingMethod));
            given(itemProcessService.existsByItemAndProcess(1L, 10L)).willReturn(true);
            given(inspectionStandardRepository.existsByItem_IdAndProcess_IdAndInspectionItem_Id(1L, 10L, 100L))
                    .willReturn(false);

            // when & then
            assertThatThrownBy(() -> inspectionStandardService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INSPECTION_STANDARD_SAMPLE_REQUIRED);
        }

        @Test
        @DisplayName("수치형이 아닌 검사항목에 하한값이 있으면 예외가 발생한다")
        void create_nonNumericLimit() {
            // given
            InspectionStandardCreateRequest request = createRequest(101L, "FULL");
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(inspectionItemService.getInspectionItem(101L)).willReturn(passFailInspectionItem);
            given(codeGroupRepository.findByGroupId("QC_INSPECTION_METHOD")).willReturn(Optional.of(methodGroup));
            given(commonCodeRepository.findByCodeGroupAndCode(methodGroup, "FULL")).willReturn(Optional.of(fullMethod));
            given(itemProcessService.existsByItemAndProcess(1L, 10L)).willReturn(true);
            given(inspectionStandardRepository.existsByItem_IdAndProcess_IdAndInspectionItem_Id(1L, 10L, 101L))
                    .willReturn(false);

            // when & then
            assertThatThrownBy(() -> inspectionStandardService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INSPECTION_STANDARD_NUMERIC_LIMIT_ONLY);
        }

        @Test
        @DisplayName("하한값이 상한값보다 크면 예외가 발생한다")
        void create_invalidLimit() {
            // given
            InspectionStandardCreateRequest request = createRequest(100L, "SAMPLING");
            ReflectionTestUtils.setField(request, "lowerLimit", BigDecimal.valueOf(11));
            ReflectionTestUtils.setField(request, "upperLimit", BigDecimal.TEN);
            given(itemService.getItem(1L)).willReturn(item);
            given(processService.getProcess(10L)).willReturn(process);
            given(inspectionItemService.getInspectionItem(100L)).willReturn(numericInspectionItem);
            given(codeGroupRepository.findByGroupId("QC_INSPECTION_METHOD")).willReturn(Optional.of(methodGroup));
            given(commonCodeRepository.findByCodeGroupAndCode(methodGroup, "SAMPLING"))
                    .willReturn(Optional.of(samplingMethod));
            given(itemProcessService.existsByItemAndProcess(1L, 10L)).willReturn(true);
            given(inspectionStandardRepository.existsByItem_IdAndProcess_IdAndInspectionItem_Id(1L, 10L, 100L))
                    .willReturn(false);

            // when & then
            assertThatThrownBy(() -> inspectionStandardService.create(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INSPECTION_STANDARD_LIMIT_INVALID);
        }
    }

    @Nested
    @DisplayName("수정")
    class Update {

        @Test
        @DisplayName("검사 기준 속성을 수정한다")
        void update_success() {
            // given
            InspectionStandardUpdateRequest request = updateRequest();
            given(inspectionStandardRepository.findById(1L)).willReturn(Optional.of(inspectionStandard));
            given(codeGroupRepository.findByGroupId("QC_INSPECTION_METHOD")).willReturn(Optional.of(methodGroup));
            given(commonCodeRepository.findByCodeGroupAndCode(methodGroup, "FULL")).willReturn(Optional.of(fullMethod));
            given(inspectionStandardMapper.toResponse(inspectionStandard)).willReturn(response);

            // when
            InspectionStandardResponse result = inspectionStandardService.update(1L, request);

            // then
            assertThat(result.getId()).isEqualTo(1L);
            verify(inspectionStandardMapper, times(1)).toResponse(inspectionStandard);
        }

        @Test
        @DisplayName("존재하지 않는 검사 기준 수정 시 예외가 발생한다")
        void update_notFound() {
            // given
            InspectionStandardUpdateRequest request = updateRequest();
            given(inspectionStandardRepository.findById(99L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> inspectionStandardService.update(99L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INSPECTION_STANDARD_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("삭제")
    class Delete {

        @Test
        @DisplayName("검사 기준을 소프트 삭제한다")
        void delete_success() {
            // given
            given(inspectionStandardRepository.findById(1L)).willReturn(Optional.of(inspectionStandard));

            // when
            inspectionStandardService.delete(1L);

            // then
            assertThat(inspectionStandard.getDeletedAt()).isNotNull();
            verify(inspectionStandardRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("존재하지 않는 검사 기준 삭제 시 예외가 발생한다")
        void delete_notFound() {
            // given
            given(inspectionStandardRepository.findById(99L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> inspectionStandardService.delete(99L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INSPECTION_STANDARD_NOT_FOUND);
        }
    }

    private InspectionStandardCreateRequest createRequest(Long inspectionItemId, String inspectionMethodCode) {
        InspectionStandardCreateRequest request = new InspectionStandardCreateRequest();
        ReflectionTestUtils.setField(request, "itemId", 1L);
        ReflectionTestUtils.setField(request, "processId", 10L);
        ReflectionTestUtils.setField(request, "inspectionItemId", inspectionItemId);
        ReflectionTestUtils.setField(request, "inspectionMethodCode", inspectionMethodCode);
        ReflectionTestUtils.setField(request, "standardValue", "10");
        ReflectionTestUtils.setField(request, "lowerLimit", BigDecimal.ONE);
        ReflectionTestUtils.setField(request, "upperLimit", BigDecimal.TEN);
        ReflectionTestUtils.setField(request, "sampleQty", 3);
        ReflectionTestUtils.setField(request, "isRequired", true);
        ReflectionTestUtils.setField(request, "sortOrder", 1);
        ReflectionTestUtils.setField(request, "isActive", true);
        return request;
    }

    private InspectionStandardUpdateRequest updateRequest() {
        InspectionStandardUpdateRequest request = new InspectionStandardUpdateRequest();
        ReflectionTestUtils.setField(request, "inspectionMethodCode", "FULL");
        ReflectionTestUtils.setField(request, "standardValue", "10");
        ReflectionTestUtils.setField(request, "lowerLimit", BigDecimal.ONE);
        ReflectionTestUtils.setField(request, "upperLimit", BigDecimal.TEN);
        ReflectionTestUtils.setField(request, "isRequired", true);
        ReflectionTestUtils.setField(request, "sortOrder", 2);
        ReflectionTestUtils.setField(request, "isActive", true);
        return request;
    }

    private Item createItem(Long id) {
        Item entity = Item.builder()
                .itemCode("ITEM-000001")
                .itemName("테스트 품목")
                .unit("EA")
                .build();
        ReflectionTestUtils.setField(entity, "id", id);
        return entity;
    }

    private MfgProcess createProcess(Long id) {
        MfgProcess entity = MfgProcess.builder()
                .processCode("PROC-000001")
                .processName("테스트 공정")
                .build();
        ReflectionTestUtils.setField(entity, "id", id);
        return entity;
    }

    private InspectionItem createInspectionItem(Long id, MeasurementType measurementType) {
        CommonCode category = createCommonCode(300L, "001", "치수");
        InspectionItem entity = InspectionItem.builder()
                .inspectionItemCode("DIM-001")
                .inspectionItemName("길이")
                .category(category)
                .measurementType(measurementType)
                .unit("MM")
                .decimalScale(2)
                .sortOrder(1)
                .isActive(true)
                .build();
        ReflectionTestUtils.setField(entity, "id", id);
        return entity;
    }

    private InspectionStandard createInspectionStandard(Long id, InspectionItem inspectionItem, CommonCode method) {
        InspectionStandard entity = InspectionStandard.builder()
                .item(item)
                .process(process)
                .inspectionItem(inspectionItem)
                .inspectionMethod(method)
                .standardValue("10")
                .lowerLimit(BigDecimal.ONE)
                .upperLimit(BigDecimal.TEN)
                .unit("MM")
                .sampleQty(3)
                .isRequired(true)
                .sortOrder(1)
                .isActive(true)
                .build();
        ReflectionTestUtils.setField(entity, "id", id);
        return entity;
    }

    private CodeGroup createCodeGroup() {
        CodeGroup entity = CodeGroup.builder()
                .groupId("QC_INSPECTION_METHOD")
                .groupName("품질검사방식")
                .build();
        ReflectionTestUtils.setField(entity, "id", 20L);
        return entity;
    }

    private CommonCode createCommonCode(Long id, String code, String codeName) {
        CommonCode entity = CommonCode.builder()
                .codeGroup(methodGroup)
                .code(code)
                .codeName(codeName)
                .sortOrder(1)
                .build();
        ReflectionTestUtils.setField(entity, "id", id);
        return entity;
    }
}
