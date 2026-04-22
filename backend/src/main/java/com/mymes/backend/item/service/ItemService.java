package com.mymes.backend.item.service;

import com.mymes.backend.item.dto.ItemCreateRequest;
import com.mymes.backend.item.dto.ItemResponse;
import com.mymes.backend.item.dto.ItemUpdateRequest;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.mapper.ItemMapper;
import com.mymes.backend.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private static final String ITEM_CODE_PREFIX = "ITEM-";
    private static final int MAX_ITEM_CODE_RETRIES = 3;

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;

    public List<ItemResponse> findAll() {
        return itemRepository.findAll().stream()
                .map(itemMapper::toResponse)
                .toList();
    }

    public ItemResponse findById(Long id) {
        return itemMapper.toResponse(getItem(id));
    }

    @Transactional
    public ItemResponse create(ItemCreateRequest request) {
        for (int attempt = 1; attempt <= MAX_ITEM_CODE_RETRIES; attempt++) {
            String itemCode = generateItemCode();
            Item item = Item.builder()
                    .itemCode(itemCode)
                    .itemName(request.getItemName())
                    .unit(request.getUnit())
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
        item.update(request.getItemName(), request.getUnit());
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

    private String generateItemCode() {
        Item latest = itemRepository.findTopByItemCodeStartingWithOrderByItemCodeDesc(ITEM_CODE_PREFIX);
        int nextSequence = latest == null ? 1 : extractSequence(latest.getItemCode()) + 1;
        return ITEM_CODE_PREFIX + String.format("%06d", nextSequence);
    }

    private int extractSequence(String itemCode) {
        return Integer.parseInt(itemCode.substring(ITEM_CODE_PREFIX.length()));
    }
}
