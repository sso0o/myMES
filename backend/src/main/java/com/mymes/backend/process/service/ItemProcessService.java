package com.mymes.backend.process.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.process.dto.ItemProcessCreateRequest;
import com.mymes.backend.process.dto.ItemProcessResponse;
import com.mymes.backend.process.dto.ItemProcessUpdateRequest;
import com.mymes.backend.process.entity.ItemProcess;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.mapper.ItemProcessMapper;
import com.mymes.backend.process.repository.ItemProcessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemProcessService {

    private final ItemProcessRepository itemProcessRepository;
    private final ItemService itemService;
    private final MfgProcessService processService;
    private final ItemProcessMapper itemProcessMapper;

    public List<ItemProcessResponse> findByItemId(Long itemId) {
        return itemProcessRepository.findByItemIdOrderBySequenceAsc(itemId).stream()
                .map(itemProcessMapper::toResponse)
                .toList();
    }

    public ItemProcessResponse findById(Long id) {
        return itemProcessMapper.toResponse(getItemProcess(id));
    }

    @Transactional
    public ItemProcessResponse create(ItemProcessCreateRequest request) {
        Item item = itemService.getItem(request.getItemId());
        MfgProcess process = processService.getProcess(request.getProcessId());

        if (itemProcessRepository.existsByItemIdAndProcessId(request.getItemId(), request.getProcessId())) {
            throw new BusinessException(ErrorCode.ITEM_PROCESS_DUPLICATED);
        }
        if (itemProcessRepository.existsByItemIdAndSequence(request.getItemId(), request.getSequence())) {
            throw new BusinessException(ErrorCode.ITEM_PROCESS_SEQUENCE_DUPLICATED);
        }

        ItemProcess itemProcess = ItemProcess.builder()
                .item(item)
                .process(process)
                .sequence(request.getSequence())
                .build();

        ItemProcess saved = itemProcessRepository.save(itemProcess);
        log.info("품목-공정 등록 완료: id={}, itemId={}, processId={}", saved.getId(), item.getId(), process.getId());
        return itemProcessMapper.toResponse(saved);
    }

    @Transactional
    public ItemProcessResponse update(Long id, ItemProcessUpdateRequest request) {
        ItemProcess itemProcess = getItemProcess(id);
        MfgProcess process = processService.getProcess(request.getProcessId());

        if (itemProcessRepository.existsByItemIdAndProcessIdAndIdNot(itemProcess.getItem().getId(), request.getProcessId(), id)) {
            throw new BusinessException(ErrorCode.ITEM_PROCESS_DUPLICATED);
        }
        if (itemProcessRepository.existsByItemIdAndSequenceAndIdNot(itemProcess.getItem().getId(), request.getSequence(), id)) {
            throw new BusinessException(ErrorCode.ITEM_PROCESS_SEQUENCE_DUPLICATED);
        }

        itemProcess.update(process, request.getSequence());
        log.info("품목-공정 수정 완료: id={}", id);
        return itemProcessMapper.toResponse(itemProcess);
    }

    @Transactional
    public void delete(Long id) {
        ItemProcess itemProcess = getItemProcess(id);
        itemProcess.delete();
        log.info("품목-공정 삭제 완료: id={}", id);
    }

    public ItemProcess getItemProcess(Long id) {
        return itemProcessRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_PROCESS_NOT_FOUND, String.valueOf(id)));
    }
}
