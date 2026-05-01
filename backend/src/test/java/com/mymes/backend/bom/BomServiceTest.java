package com.mymes.backend.bom;

import com.mymes.backend.bom.dto.BomCreateRequest;
import com.mymes.backend.bom.dto.BomResponse;
import com.mymes.backend.bom.dto.BomUpdateRequest;
import com.mymes.backend.bom.entity.Bom;
import com.mymes.backend.bom.mapper.BomMapper;
import com.mymes.backend.bom.repository.BomRepository;
import com.mymes.backend.bom.service.BomService;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

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

    @Test
    @DisplayName("BOM 생성에 성공한다")
    void create_success() {
        // given
        BomCreateRequest request = makeCreateRequest(1L, 2L, 1, BigDecimal.valueOf(2));
        Item parentItem = makeItem(1L);
        Item materialItem = makeItem(2L);
        Bom saved = makeBom(1L, 2L, 1, BigDecimal.valueOf(2));
        BomResponse response = BomResponse.builder().id(10L).quantity(BigDecimal.valueOf(2)).build();

        given(itemService.getItem(1L)).willReturn(parentItem);
        given(itemService.getItem(2L)).willReturn(materialItem);
        given(bomRepository.existsByParentItemIdAndMaterialItemId(1L, 2L)).willReturn(false);
        given(bomRepository.existsByParentItemIdAndSequence(1L, 1)).willReturn(false);
        given(bomRepository.save(any(Bom.class))).willReturn(saved);
        given(bomMapper.toResponse(saved)).willReturn(response);

        // when
        BomResponse result = bomService.create(request);

        // then
        assertThat(result.getQuantity()).isEqualByComparingTo(BigDecimal.valueOf(2));
        verify(bomRepository).save(any(Bom.class));
    }

    @Test
    @DisplayName("제품 품목과 자재 품목이 같으면 BOM 생성 시 예외가 발생한다")
    void create_selfReference_throwsException() {
        // given
        BomCreateRequest request = makeCreateRequest(1L, 1L, 1, BigDecimal.ONE);

        // when & then
        assertThatThrownBy(() -> bomService.create(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.BOM_SELF_REFERENCE);
    }

    @Test
    @DisplayName("소요수량이 0 이하이면 BOM 생성 시 예외가 발생한다")
    void create_invalidQuantity_throwsException() {
        // given
        BomCreateRequest request = makeCreateRequest(1L, 2L, 1, BigDecimal.ZERO);

        // when & then
        assertThatThrownBy(() -> bomService.create(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.BOM_QUANTITY_INVALID);
    }

    @Test
    @DisplayName("같은 제품에 같은 자재가 이미 있으면 BOM 생성 시 예외가 발생한다")
    void create_duplicateMaterial_throwsException() {
        // given
        BomCreateRequest request = makeCreateRequest(1L, 2L, 1, BigDecimal.ONE);
        given(itemService.getItem(1L)).willReturn(makeItem(1L));
        given(itemService.getItem(2L)).willReturn(makeItem(2L));
        given(bomRepository.existsByParentItemIdAndMaterialItemId(1L, 2L)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> bomService.create(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.BOM_DUPLICATED);
    }

    @Test
    @DisplayName("같은 제품에 같은 순서가 이미 있으면 BOM 생성 시 예외가 발생한다")
    void create_duplicateSequence_throwsException() {
        // given
        BomCreateRequest request = makeCreateRequest(1L, 2L, 1, BigDecimal.ONE);
        given(itemService.getItem(1L)).willReturn(makeItem(1L));
        given(itemService.getItem(2L)).willReturn(makeItem(2L));
        given(bomRepository.existsByParentItemIdAndMaterialItemId(1L, 2L)).willReturn(false);
        given(bomRepository.existsByParentItemIdAndSequence(1L, 1)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> bomService.create(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.BOM_SEQUENCE_DUPLICATED);
    }

    @Test
    @DisplayName("BOM 수정에 성공한다")
    void update_success() {
        // given
        Bom bom = makeBom(1L, 2L, 1, BigDecimal.ONE);
        BomUpdateRequest request = makeUpdateRequest(3L, 2, BigDecimal.valueOf(3));
        Item materialItem = makeItem(3L);
        BomResponse response = BomResponse.builder().id(10L).materialItemId(3L).sequence(2).build();

        given(bomRepository.findById(10L)).willReturn(Optional.of(bom));
        given(itemService.getItem(3L)).willReturn(materialItem);
        given(bomRepository.existsByParentItemIdAndMaterialItemIdAndIdNot(1L, 3L, 10L)).willReturn(false);
        given(bomRepository.existsByParentItemIdAndSequenceAndIdNot(1L, 2, 10L)).willReturn(false);
        given(bomMapper.toResponse(bom)).willReturn(response);

        // when
        BomResponse result = bomService.update(10L, request);

        // then
        assertThat(result.getMaterialItemId()).isEqualTo(3L);
        assertThat(bom.getMaterialItem().getId()).isEqualTo(3L);
        assertThat(bom.getSequence()).isEqualTo(2);
    }

    @Test
    @DisplayName("BOM 삭제 시 소프트 삭제한다")
    void delete_success() {
        // given
        Bom bom = makeBom(1L, 2L, 1, BigDecimal.ONE);
        given(bomRepository.findById(10L)).willReturn(Optional.of(bom));

        // when
        bomService.delete(10L);

        // then
        assertThat(bom.getDeletedAt()).isNotNull();
    }

    private BomCreateRequest makeCreateRequest(Long parentItemId, Long materialItemId, Integer sequence, BigDecimal quantity) {
        BomCreateRequest request = new BomCreateRequest();
        ReflectionTestUtils.setField(request, "parentItemId", parentItemId);
        ReflectionTestUtils.setField(request, "materialItemId", materialItemId);
        ReflectionTestUtils.setField(request, "sequence", sequence);
        ReflectionTestUtils.setField(request, "quantity", quantity);
        return request;
    }

    private BomUpdateRequest makeUpdateRequest(Long materialItemId, Integer sequence, BigDecimal quantity) {
        BomUpdateRequest request = new BomUpdateRequest();
        ReflectionTestUtils.setField(request, "materialItemId", materialItemId);
        ReflectionTestUtils.setField(request, "sequence", sequence);
        ReflectionTestUtils.setField(request, "quantity", quantity);
        return request;
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
