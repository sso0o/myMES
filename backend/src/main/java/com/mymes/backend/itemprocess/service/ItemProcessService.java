package com.mymes.backend.itemprocess.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.dto.ItemResponse;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.mapper.ItemMapper;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.itemprocess.dto.CopyMode;
import com.mymes.backend.itemprocess.dto.ItemProcessBulkCopyRequest;
import com.mymes.backend.itemprocess.dto.ItemProcessBulkCopyResponse;
import com.mymes.backend.itemprocess.dto.ItemProcessCreateRequest;
import com.mymes.backend.itemprocess.dto.ItemProcessResponse;
import com.mymes.backend.itemprocess.dto.ItemProcessUpdateRequest;
import com.mymes.backend.itemprocess.entity.ItemProcess;
import com.mymes.backend.itemprocess.mapper.ItemProcessMapper;
import com.mymes.backend.itemprocess.repository.ItemProcessRepository;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.service.MfgProcessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemProcessService {

    private final ItemProcessRepository itemProcessRepository;
    private final ItemService itemService;
    private final MfgProcessService processService;
    private final ItemProcessMapper itemProcessMapper;
    private final ItemMapper itemMapper;

    /**
     * 특정 품목의 공정 매핑 목록을 순서 기준으로 조회합니다.
     *
     * @param itemId 품목 ID
     * @return 품목-공정 매핑 응답 목록
     */
    public List<ItemProcessResponse> findByItemId(Long itemId) {
        return itemProcessRepository.findByItemIdOrderBySequenceAsc(itemId).stream()
                .map(itemProcessMapper::toResponse)
                .toList();
    }

    /**
     * 공정이 하나 이상 등록된 품목 목록을 조회합니다.
     *
     * @return 공정 매핑이 존재하는 품목 응답 목록
     */
    public List<ItemResponse> findItemsWithProcesses() {
        return itemProcessRepository.findDistinctItemsWithProcesses().stream()
                .map(itemMapper::toResponse)
                .toList();
    }

    /**
     * 품목의 전체 공정 목록을 순서 기준으로 엔티티로 조회합니다.
     *
     * @param itemId 품목 ID
     * @return 품목-공정 매핑 엔티티 목록 (sequence ASC)
     */
    public List<ItemProcess> findAllEntitiesByItemId(Long itemId) {
        return itemProcessRepository.findByItemIdOrderBySequenceAsc(itemId);
    }

    /**
     * 품목의 첫 번째 공정을 순서 기준으로 조회합니다.
     *
     * @param itemId 품목 ID
     * @return 첫 번째 품목-공정 매핑
     */
    public Optional<ItemProcess> findFirstByItemId(Long itemId) {
        return itemProcessRepository.findByItemIdOrderBySequenceAsc(itemId).stream()
                .findFirst();
    }

    /**
     * 품목에 특정 공정이 등록되어 있는지 확인합니다.
     *
     * @param itemId 품목 ID
     * @param processId 공정 ID
     * @return 품목-공정 등록 여부
     */
    public boolean existsByItemAndProcess(Long itemId, Long processId) {
        return itemProcessRepository.existsByItemIdAndProcessId(itemId, processId);
    }

    /**
     * 품목-공정 매핑을 ID로 조회합니다.
     *
     * @param id 품목-공정 매핑 ID
     * @return 품목-공정 매핑 응답
     */
    public ItemProcessResponse findById(Long id) {
        return itemProcessMapper.toResponse(getItemProcess(id));
    }

    /**
     * 품목-공정 매핑을 생성합니다.
     *
     * @param request 생성 요청
     * @return 생성된 품목-공정 매핑 응답
     */
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

    /**
     * 품목-공정 매핑을 수정합니다.
     *
     * @param id 품목-공정 매핑 ID
     * @param request 수정 요청
     * @return 수정된 품목-공정 매핑 응답
     */
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

    /**
     * 품목-공정 매핑을 삭제합니다.
     *
     * @param id 품목-공정 매핑 ID
     */
    @Transactional
    public void delete(Long id) {
        ItemProcess itemProcess = getItemProcess(id);
        itemProcess.delete();
        log.info("품목-공정 삭제 완료: id={}", id);
    }

    /**
     * 품목-공정 매핑 엔티티를 ID로 조회합니다.
     *
     * @param id 품목-공정 매핑 ID
     * @return 품목-공정 매핑 엔티티
     */
    public ItemProcess getItemProcess(Long id) {
        return itemProcessRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_PROCESS_NOT_FOUND, String.valueOf(id)));
    }

    /**
     * 원본 품목의 공정 목록을 여러 대상 품목에 일괄 복사합니다.
     * 전체 트랜잭션으로 처리하며, 하나라도 실패하면 전체 롤백됩니다.
     *
     * @param request 복사 요청 (sourceItemId, targetItemIds, mode)
     * @return 복사 결과 (sourceItemId, targetCount, copiedCount)
     * @throws BusinessException 대상 품목이 없는 경우, 원본과 대상이 같은 경우, 원본 공정이 없는 경우, 대상 품목이 존재하지 않는 경우
     */
    @Transactional
    public ItemProcessBulkCopyResponse bulkCopy(ItemProcessBulkCopyRequest request) {
        List<Long> targetIds = request.getTargetItemIds();

        if (targetIds == null || targetIds.isEmpty()) {
            throw new BusinessException(ErrorCode.ITEM_PROCESS_COPY_TARGET_EMPTY);
        }
        if (targetIds.contains(request.getSourceItemId())) {
            throw new BusinessException(ErrorCode.ITEM_PROCESS_COPY_SOURCE_TARGET_SAME);
        }

        List<ItemProcess> sourceProcesses =
                itemProcessRepository.findByItemIdOrderBySequenceAsc(request.getSourceItemId());
        if (sourceProcesses.isEmpty()) {
            throw new BusinessException(ErrorCode.ITEM_PROCESS_COPY_EMPTY_SOURCE);
        }

        // 대상 품목 존재 여부 사전 검증 (하나라도 없으면 전체 롤백)
        List<Item> targetItems = targetIds.stream()
                .map(itemService::getItem)
                .toList();

        for (Item targetItem : targetItems) {
            if (request.getMode() == CopyMode.REPLACE) {
                copyReplace(targetItem, sourceProcesses);
            } else {
                copyAppend(targetItem, sourceProcesses);
            }
        }

        log.info("품목별 공정 일괄 복사 완료: sourceItemId={}, mode={}, targetCount={}",
                request.getSourceItemId(), request.getMode(), targetIds.size());

        return ItemProcessBulkCopyResponse.builder()
                .sourceItemId(request.getSourceItemId())
                .targetCount(targetIds.size())
                .copiedCount(targetIds.size())
                .build();
    }

    /**
     * 대상 품목의 기존 공정을 모두 삭제하고 원본 공정으로 교체합니다.
     */
    private void copyReplace(Item targetItem, List<ItemProcess> sourceProcesses) {
        // unique constraint 충돌 방지를 위해 hard delete 사용
        itemProcessRepository.hardDeleteAllByItemId(targetItem.getId());

        List<ItemProcess> copies = sourceProcesses.stream()
                .map(src -> ItemProcess.builder()
                        .item(targetItem)
                        .process(src.getProcess())
                        .sequence(src.getSequence())
                        .build())
                .toList();
        itemProcessRepository.saveAll(copies);
    }

    /**
     * 대상 품목의 현재 마지막 순서 뒤에 원본 공정을 이어서 추가합니다.
     * 대상 품목에 이미 원본 공정과 같은 공정이 있으면 ITEM_PROCESS_DUPLICATED 예외가 발생합니다.
     */
    private void copyAppend(Item targetItem, List<ItemProcess> sourceProcesses) {
        int offset = itemProcessRepository
                .findMaxSequenceByItemId(targetItem.getId())
                .orElse(0);

        // 대상 품목에 이미 존재하는 processId 목록을 조회해 중복 사전 검증
        List<Long> existingProcessIds = itemProcessRepository
                .findByItemIdOrderBySequenceAsc(targetItem.getId()).stream()
                .map(ip -> ip.getProcess().getId())
                .toList();

        for (ItemProcess src : sourceProcesses) {
            if (existingProcessIds.contains(src.getProcess().getId())) {
                throw new BusinessException(ErrorCode.ITEM_PROCESS_DUPLICATED);
            }
        }

        List<ItemProcess> copies = sourceProcesses.stream()
                .map(src -> ItemProcess.builder()
                        .item(targetItem)
                        .process(src.getProcess())
                        .sequence(src.getSequence() + offset)
                        .build())
                .toList();
        itemProcessRepository.saveAll(copies);
    }
}
