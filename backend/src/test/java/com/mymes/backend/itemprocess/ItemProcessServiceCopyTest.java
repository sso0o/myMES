package com.mymes.backend.itemprocess;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.itemprocess.dto.CopyMode;
import com.mymes.backend.itemprocess.dto.ItemProcessBulkCopyRequest;
import com.mymes.backend.itemprocess.dto.ItemProcessBulkCopyResponse;
import com.mymes.backend.itemprocess.entity.ItemProcess;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.itemprocess.mapper.ItemProcessMapper;
import com.mymes.backend.itemprocess.repository.ItemProcessRepository;
import com.mymes.backend.itemprocess.service.ItemProcessService;
import com.mymes.backend.process.service.MfgProcessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemProcessServiceCopyTest {

    @InjectMocks
    private ItemProcessService itemProcessService;

    @Mock
    private ItemProcessRepository itemProcessRepository;

    @Mock
    private ItemService itemService;

    @Mock
    private MfgProcessService processService;

    @Mock
    private ItemProcessMapper itemProcessMapper;

    private Item sourceItem;
    private Item targetItem1;
    private Item targetItem2;
    private MfgProcess process1;
    private MfgProcess process2;
    private ItemProcess itemProcess1;
    private ItemProcess itemProcess2;

    @BeforeEach
    void setUp() {
        sourceItem = Item.builder().itemCode("SRC-001").itemName("원본품목").unit("EA").build();
        ReflectionTestUtils.setField(sourceItem, "id", 1L);

        targetItem1 = Item.builder().itemCode("TGT-001").itemName("대상품목1").unit("EA").build();
        ReflectionTestUtils.setField(targetItem1, "id", 2L);

        targetItem2 = Item.builder().itemCode("TGT-002").itemName("대상품목2").unit("EA").build();
        ReflectionTestUtils.setField(targetItem2, "id", 3L);

        process1 = MfgProcess.builder().processCode("P-001").processName("공정1").build();
        ReflectionTestUtils.setField(process1, "id", 10L);

        process2 = MfgProcess.builder().processCode("P-002").processName("공정2").build();
        ReflectionTestUtils.setField(process2, "id", 20L);

        itemProcess1 = ItemProcess.builder().item(sourceItem).process(process1).sequence(1).build();
        itemProcess2 = ItemProcess.builder().item(sourceItem).process(process2).sequence(2).build();
    }

    @Test
    @DisplayName("REPLACE 모드: 다중 대상 품목에 원본 공정을 교체 복사한다")
    void bulkCopy_replace_success() {
        // given
        ItemProcessBulkCopyRequest request = makeRequest(List.of(2L, 3L), CopyMode.REPLACE);

        given(itemProcessRepository.findByItemIdOrderBySequenceAsc(1L))
                .willReturn(List.of(itemProcess1, itemProcess2));
        given(itemService.getItem(2L)).willReturn(targetItem1);
        given(itemService.getItem(3L)).willReturn(targetItem2);
        given(itemProcessRepository.saveAll(any())).willReturn(Collections.emptyList());

        // when
        ItemProcessBulkCopyResponse response = itemProcessService.bulkCopy(request);

        // then
        assertThat(response.getSourceItemId()).isEqualTo(1L);
        assertThat(response.getTargetCount()).isEqualTo(2);
        assertThat(response.getCopiedCount()).isEqualTo(2);
        verify(itemProcessRepository, times(2)).hardDeleteAllByItemId(anyLong());
        verify(itemProcessRepository, times(2)).saveAll(any());
    }

    @Test
    @DisplayName("APPEND 모드: 다중 대상 품목의 마지막 순서 뒤에 원본 공정을 이어서 추가한다")
    void bulkCopy_append_success() {
        // given
        ItemProcessBulkCopyRequest request = makeRequest(List.of(2L, 3L), CopyMode.APPEND);

        given(itemProcessRepository.findByItemIdOrderBySequenceAsc(1L))
                .willReturn(List.of(itemProcess1, itemProcess2));
        given(itemService.getItem(2L)).willReturn(targetItem1);
        given(itemService.getItem(3L)).willReturn(targetItem2);
        given(itemProcessRepository.findMaxSequenceByItemId(2L)).willReturn(Optional.of(3));
        given(itemProcessRepository.findMaxSequenceByItemId(3L)).willReturn(Optional.empty());
        given(itemProcessRepository.findByItemIdOrderBySequenceAsc(2L)).willReturn(Collections.emptyList());
        given(itemProcessRepository.findByItemIdOrderBySequenceAsc(3L)).willReturn(Collections.emptyList());
        given(itemProcessRepository.saveAll(any())).willReturn(Collections.emptyList());

        // when
        ItemProcessBulkCopyResponse response = itemProcessService.bulkCopy(request);

        // then
        assertThat(response.getCopiedCount()).isEqualTo(2);
        verify(itemProcessRepository, times(2)).saveAll(any());
    }

    @Test
    @DisplayName("targetItemIds가 비어 있으면 ITEM_PROCESS_COPY_TARGET_EMPTY 예외가 발생한다")
    void bulkCopy_emptyTargets_throwsException() {
        // given
        ItemProcessBulkCopyRequest request = makeRequest(Collections.emptyList(), CopyMode.REPLACE);

        // when & then
        assertThatThrownBy(() -> itemProcessService.bulkCopy(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ITEM_PROCESS_COPY_TARGET_EMPTY);
    }

    @Test
    @DisplayName("sourceItemId가 targetItemIds에 포함되면 ITEM_PROCESS_COPY_SOURCE_TARGET_SAME 예외가 발생한다")
    void bulkCopy_sourceEqualsTarget_throwsException() {
        // given — target list contains source id (1L)
        ItemProcessBulkCopyRequest request = makeRequest(List.of(1L, 2L), CopyMode.REPLACE);

        // when & then
        assertThatThrownBy(() -> itemProcessService.bulkCopy(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ITEM_PROCESS_COPY_SOURCE_TARGET_SAME);
    }

    @Test
    @DisplayName("원본 품목에 공정이 없으면 ITEM_PROCESS_COPY_EMPTY_SOURCE 예외가 발생한다")
    void bulkCopy_emptySource_throwsException() {
        // given
        ItemProcessBulkCopyRequest request = makeRequest(List.of(2L), CopyMode.REPLACE);
        given(itemProcessRepository.findByItemIdOrderBySequenceAsc(1L)).willReturn(Collections.emptyList());

        // when & then
        assertThatThrownBy(() -> itemProcessService.bulkCopy(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ITEM_PROCESS_COPY_EMPTY_SOURCE);
    }

    @Test
    @DisplayName("대상 품목 중 존재하지 않는 ID가 있으면 ITEM_NOT_FOUND 예외가 발생한다")
    void bulkCopy_targetNotFound_throwsException() {
        // given
        ItemProcessBulkCopyRequest request = makeRequest(List.of(2L, 999L), CopyMode.REPLACE);
        given(itemProcessRepository.findByItemIdOrderBySequenceAsc(1L))
                .willReturn(List.of(itemProcess1, itemProcess2));
        given(itemService.getItem(2L)).willReturn(targetItem1);
        given(itemService.getItem(999L)).willThrow(new BusinessException(ErrorCode.ITEM_NOT_FOUND, "999"));

        // when & then
        assertThatThrownBy(() -> itemProcessService.bulkCopy(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ITEM_NOT_FOUND);
    }

    @Test
    @DisplayName("APPEND 모드에서 대상 품목에 원본 공정이 이미 있으면 ITEM_PROCESS_DUPLICATED 예외가 발생한다")
    void bulkCopy_append_duplicateProcess_throwsException() {
        // given — target already has process1
        ItemProcess existingInTarget = ItemProcess.builder()
                .item(targetItem1).process(process1).sequence(1).build();

        ItemProcessBulkCopyRequest request = makeRequest(List.of(2L), CopyMode.APPEND);
        given(itemProcessRepository.findByItemIdOrderBySequenceAsc(1L))
                .willReturn(List.of(itemProcess1, itemProcess2));
        given(itemService.getItem(2L)).willReturn(targetItem1);
        given(itemProcessRepository.findMaxSequenceByItemId(2L)).willReturn(Optional.of(1));
        given(itemProcessRepository.findByItemIdOrderBySequenceAsc(2L))
                .willReturn(List.of(existingInTarget));

        // when & then
        assertThatThrownBy(() -> itemProcessService.bulkCopy(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ITEM_PROCESS_DUPLICATED);
    }

    // ---- 헬퍼 ----

    private ItemProcessBulkCopyRequest makeRequest(List<Long> targetIds, CopyMode mode) {
        ItemProcessBulkCopyRequest req = new ItemProcessBulkCopyRequest();
        ReflectionTestUtils.setField(req, "sourceItemId", 1L);
        ReflectionTestUtils.setField(req, "targetItemIds", targetIds);
        ReflectionTestUtils.setField(req, "mode", mode);
        return req;
    }
}
