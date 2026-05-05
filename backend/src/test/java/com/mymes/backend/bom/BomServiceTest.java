package com.mymes.backend.bom;

import com.mymes.backend.bom.dto.BomResponse;
import com.mymes.backend.bom.entity.Bom;
import com.mymes.backend.bom.mapper.BomMapper;
import com.mymes.backend.bom.repository.BomRepository;
import com.mymes.backend.bom.service.BomService;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class BomServiceTest {

    @InjectMocks
    private BomService bomService;

    @Mock
    private BomRepository bomRepository;

    @Mock
    private BomMapper bomMapper;

    @Mock
    private ItemService itemService;

    @Test
    @DisplayName("제품 품목 ID로 BOM 목록을 조회한다")
    void findByParentItemId_returnsList() {
        // given
        Bom bom = makeBom(1L, 2L, 1, BigDecimal.ONE);
        BomResponse response = BomResponse.builder().id(10L).materialItemId(2L).build();
        given(bomRepository.findByParentItemIdOrderBySequenceAsc(1L)).willReturn(List.of(bom));
        given(bomMapper.toResponse(bom)).willReturn(response);

        // when
        List<BomResponse> result = bomService.findByParentItemId(1L);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMaterialItemId()).isEqualTo(2L);
    }

    private Bom makeBom(Long parentItemId, Long materialItemId, Integer sequence, BigDecimal quantity) {
        return Bom.builder()
                .parentItem(makeItem(parentItemId))
                .materialItem(makeItem(materialItemId))
                .sequence(sequence)
                .quantity(quantity)
                .build();
    }

    private Item makeItem(Long id) {
        Item item = Item.builder()
                .itemCode("ITEM-" + id)
                .itemName("품목 " + id)
                .unit("EA")
                .build();
        ReflectionTestUtils.setField(item, "id", id);
        return item;
    }
}
