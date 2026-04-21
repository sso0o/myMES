package com.mymes.backend.item.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.dto.ItemCreateRequest;
import com.mymes.backend.item.dto.ItemResponse;
import com.mymes.backend.item.dto.ItemUpdateRequest;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.mapper.ItemMapper;
import com.mymes.backend.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

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
        if (itemRepository.existsByItemCode(request.getItemCode())) {
            throw new BusinessException(ErrorCode.ITEM_CODE_DUPLICATED, request.getItemCode());
        }
        Item item = Item.builder()
                .itemCode(request.getItemCode())
                .itemName(request.getItemName())
                .unit(request.getUnit())
                .build();
        Item saved = itemRepository.save(item);
        log.info("품목 생성 완료: id={}, code={}", saved.getId(), saved.getItemCode());
        return itemMapper.toResponse(saved);
    }

    @Transactional
    public ItemResponse update(Long id, ItemUpdateRequest request) {
        Item item = getItem(id);
        if (itemRepository.existsByItemCodeAndIdNot(request.getItemCode(), id)) {
            throw new BusinessException(ErrorCode.ITEM_CODE_DUPLICATED, request.getItemCode());
        }
        item.update(request.getItemCode(), request.getItemName(), request.getUnit());
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
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_NOT_FOUND, String.valueOf(id)));
    }
}
