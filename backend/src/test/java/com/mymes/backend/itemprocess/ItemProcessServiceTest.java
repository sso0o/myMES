package com.mymes.backend.itemprocess;

import com.mymes.backend.item.dto.ItemResponse;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.mapper.ItemMapper;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.itemprocess.entity.ItemProcess;
import com.mymes.backend.itemprocess.mapper.ItemProcessMapper;
import com.mymes.backend.itemprocess.repository.ItemProcessRepository;
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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ItemProcessServiceTest {

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

    @Mock
    private ItemMapper itemMapper;

    private Item item;
    private MfgProcess process;
    private ItemProcess itemProcess;

    @BeforeEach
    void setUp() {
        item = Item.builder()
                .itemCode("ITEM-000001")
                .itemName("테스트 품목")
                .unit("EA")
                .build();
        ReflectionTestUtils.setField(item, "id", 1L);

        process = MfgProcess.builder()
                .processCode("PROC-000001")
                .processName("테스트 공정")
                .build();
        ReflectionTestUtils.setField(process, "id", 10L);

        itemProcess = ItemProcess.builder()
                .item(item)
                .process(process)
                .sequence(1)
                .build();
        ReflectionTestUtils.setField(itemProcess, "id", 100L);
    }

    @Nested
    @DisplayName("공정 등록 품목 조회")
    class FindItemsWithProcesses {

        @Test
        @DisplayName("공정이 하나 이상 등록된 품목만 응답으로 변환해 반환한다")
        void findItemsWithProcesses_success() {
            // given
            ItemResponse itemResponse = ItemResponse.builder()
                    .id(1L)
                    .itemCode("ITEM-000001")
                    .itemName("테스트 품목")
                    .unit("EA")
                    .build();
            given(itemProcessRepository.findDistinctItemsWithProcesses()).willReturn(List.of(item));
            given(itemMapper.toResponse(item)).willReturn(itemResponse);

            // when
            List<ItemResponse> result = itemProcessService.findItemsWithProcesses();

            // then
            assertThat(result).containsExactly(itemResponse);
            verify(itemProcessRepository, times(1)).findDistinctItemsWithProcesses();
            verify(itemMapper, times(1)).toResponse(item);
        }
    }

    @Nested
    @DisplayName("첫 번째 공정 조회")
    class FindFirstByItemId {

        @Test
        @DisplayName("품목의 첫 번째 공정을 순서 기준으로 조회한다")
        void findFirstByItemId_success() {
            // given
            given(itemProcessRepository.findByItemIdOrderBySequenceAsc(1L)).willReturn(List.of(itemProcess));

            // when
            Optional<ItemProcess> result = itemProcessService.findFirstByItemId(1L);

            // then
            assertThat(result).contains(itemProcess);
            assertThat(result.get().getProcess()).isEqualTo(process);
            verify(itemProcessRepository, times(1)).findByItemIdOrderBySequenceAsc(1L);
        }

        @Test
        @DisplayName("품목 공정이 없으면 빈 값을 반환한다")
        void findFirstByItemId_empty() {
            // given
            given(itemProcessRepository.findByItemIdOrderBySequenceAsc(1L)).willReturn(List.of());

            // when
            Optional<ItemProcess> result = itemProcessService.findFirstByItemId(1L);

            // then
            assertThat(result).isEmpty();
            verify(itemProcessRepository, times(1)).findByItemIdOrderBySequenceAsc(1L);
        }
    }

    @Nested
    @DisplayName("품목-공정 존재 여부")
    class ExistsByItemAndProcess {

        @Test
        @DisplayName("품목에 등록된 공정이면 참을 반환한다")
        void existsByItemAndProcess_true() {
            // given
            given(itemProcessRepository.existsByItemIdAndProcessId(1L, 10L)).willReturn(true);

            // when
            boolean result = itemProcessService.existsByItemAndProcess(1L, 10L);

            // then
            assertThat(result).isTrue();
            verify(itemProcessRepository, times(1)).existsByItemIdAndProcessId(1L, 10L);
        }
    }
}
