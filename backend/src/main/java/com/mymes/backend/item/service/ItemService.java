package com.mymes.backend.item.service;

import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.code.repository.CommonCodeRepository;
import com.mymes.backend.item.dto.ItemCreateRequest;
import com.mymes.backend.item.dto.ItemResponse;
import com.mymes.backend.item.dto.ItemUpdateRequest;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.mapper.ItemMapper;
import com.mymes.backend.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private static final String ITEM_CODE_PREFIX = "ITEM-";
    private static final int MAX_ITEM_CODE_RETRIES = 3;

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;
    private final CommonCodeRepository commonCodeRepository;

    /**
     * 품목 목록을 페이지 단위로 조회합니다.
     *
     * @param pageable 페이지 번호, 크기, 정렬 정보
     * @return 페이지 단위 품목 응답 목록
     */
    public Page<ItemResponse> findAll(Pageable pageable) {
        return itemRepository.findAll(pageable)
                .map(itemMapper::toResponse);
    }

    public ItemResponse findById(Long id) {
        return itemMapper.toResponse(getItem(id));
    }

    @Transactional
    public ItemResponse create(ItemCreateRequest request) {
        CommonCode itemType = resolveItemType(request.getItemTypeId());

        for (int attempt = 1; attempt <= MAX_ITEM_CODE_RETRIES; attempt++) {
            String itemCode = generateItemCode(itemType);
            Item item = Item.builder()
                    .itemCode(itemCode)
                    .itemName(request.getItemName())
                    .unit(request.getUnit())
                    .itemType(itemType)
                    .build();

            try {
                Item saved = itemRepository.saveAndFlush(item);
                log.info("품목 생성 완료: id={}, code={}", saved.getId(), saved.getItemCode());
                return itemMapper.toResponse(saved);
            } catch (DataIntegrityViolationException e) {
                log.warn("품목 코드 충돌로 재시도합니다. attempt={}, itemCode={}", attempt, itemCode);
                if (attempt == MAX_ITEM_CODE_RETRIES) {
                    throw e;
                }
            }
        }

        throw new IllegalStateException("품목 코드 생성 재시도 로직이 비정상 종료되었습니다.");
    }

    @Transactional
    public ItemResponse update(Long id, ItemUpdateRequest request) {
        Item item = getItem(id);
        CommonCode itemType = resolveItemType(request.getItemTypeId());
        item.update(request.getItemName(), request.getUnit(), itemType);
        log.info("품목 수정 완료: id={}", id);
        return itemMapper.toResponse(item);
    }

    @Transactional
    public void delete(Long id) {
        Item item = getItem(id);
        item.delete();
        log.info("품목 삭제 완료: id={}", id);
    }

    public Item getItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new com.mymes.backend.common.exception.BusinessException(
                        com.mymes.backend.common.exception.ErrorCode.ITEM_NOT_FOUND,
                        String.valueOf(id)));
    }

    private CommonCode resolveItemType(Long itemTypeId) {
        if (itemTypeId == null) return null;
        return commonCodeRepository.findById(itemTypeId)
                .orElseThrow(() -> new com.mymes.backend.common.exception.BusinessException(
                        com.mymes.backend.common.exception.ErrorCode.COMMON_CODE_NOT_FOUND,
                        String.valueOf(itemTypeId)));
    }

    private String generateItemCode(CommonCode itemType) {
        String prefix = (itemType != null
                && itemType.getNumberingPrefix() != null
                && !itemType.getNumberingPrefix().isBlank())
                ? itemType.getNumberingPrefix().toUpperCase() + "-"
                : ITEM_CODE_PREFIX;
        Item latest = itemRepository.findTopByItemCodeStartingWithOrderByItemCodeDesc(prefix);
        int nextSequence = latest == null ? 1 : extractSequence(latest.getItemCode(), prefix) + 1;
        return prefix + String.format("%06d", nextSequence);
    }

    private int extractSequence(String itemCode, String prefix) {
        try {
            return Integer.parseInt(itemCode.substring(prefix.length()));
        } catch (NumberFormatException e) {
            log.warn("채번 시퀀스 추출 실패, 1부터 시작합니다. itemCode={}", itemCode);
            return 0;
        }
    }
}
