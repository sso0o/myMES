package com.mymes.backend.bom.service;

import com.mymes.backend.bom.dto.BomBulkCopyRequest;
import com.mymes.backend.bom.dto.BomBulkCopyResponse;
import com.mymes.backend.bom.dto.BomCopyMode;
import com.mymes.backend.bom.dto.BomResponse;
import com.mymes.backend.bom.dto.BomSaveRequest;
import com.mymes.backend.bom.dto.BomVersionResponse;
import com.mymes.backend.bom.entity.Bom;
import com.mymes.backend.bom.entity.BomVersion;
import com.mymes.backend.bom.mapper.BomMapper;
import com.mymes.backend.bom.repository.BomRepository;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BomService {

    private final BomRepository bomRepository;
    private final BomMapper bomMapper;
    private final ItemService itemService;
    private final BomVersionService bomVersionService;

    /**
     * 제품 품목의 ACTIVE 버전 BOM 라인 목록을 순서 오름차순으로 조회합니다.
     *
     * @param parentItemId 제품 품목 ID
     * @return BOM 응답 목록
     */
    public List<BomResponse> findByParentItemId(Long parentItemId) {
        return bomRepository.findByParentItemIdOrderBySequenceAsc(parentItemId).stream()
                .map(bomMapper::toResponse)
                .toList();
    }

    /**
     * 특정 BOM 버전의 라인 목록을 순서 오름차순으로 조회합니다.
     * 소프트 삭제된 라인도 포함하여 이력 조회가 가능합니다.
     *
     * @param parentItemId 제품 품목 ID (버전 소유 검증용)
     * @param versionId    BOM 버전 ID
     * @return BOM 응답 목록
     * @throws BusinessException 버전이 없거나 해당 품목 소속이 아닌 경우
     */
    public List<BomResponse> findByVersion(Long parentItemId, Long versionId) {
        BomVersion version = bomVersionService.getVersion(versionId);
        if (!version.getParentItem().getId().equals(parentItemId)) {
            throw new BusinessException(ErrorCode.BOM_VERSION_ITEM_MISMATCH);
        }
        return bomRepository.findByBomVersionIdIncludingDeleted(versionId).stream()
                .map(bomMapper::toResponse)
                .toList();
    }

    /**
     * 제품 품목의 BOM 버전 이력을 버전 번호 내림차순으로 조회합니다.
     *
     * @param parentItemId 제품 품목 ID
     * @return BOM 버전 응답 목록
     */
    public List<BomVersionResponse> findVersionHistory(Long parentItemId) {
        return bomVersionService.findAllVersions(parentItemId);
    }

    /**
     * BOM 라인 전체를 일괄 저장합니다.
     * 기존 ACTIVE 버전의 라인을 소프트 삭제하고 새 버전을 생성하는 copy-on-write 방식으로 동작합니다.
     *
     * @param parentItemId 제품 품목 ID
     * @param request      저장할 BOM 라인 목록
     * @return 새로 생성된 버전의 BOM 라인 목록
     * @throws BusinessException 자기 참조, 수량 오류, 중복 자재, 중복 순서인 경우
     */
    @Transactional
    public List<BomResponse> save(Long parentItemId, BomSaveRequest request) {
        Item parentItem = itemService.getItem(parentItemId);
        validateLines(parentItemId, request.getLines());

        softDeleteActiveLines(parentItemId);
        bomRepository.flush();

        BomVersion newVersion = bomVersionService.createNewVersion(parentItem);

        List<Bom> newLines = request.getLines().stream()
                .map(line -> buildLine(parentItem, newVersion, line))
                .toList();
        bomRepository.saveAll(newLines);

        log.info("BOM 일괄 저장 완료: parentItemId={}, versionNo={}, lineCount={}",
                parentItemId, newVersion.getVersionNo(), newLines.size());

        return bomRepository.findByParentItemIdOrderBySequenceAsc(parentItemId).stream()
                .map(bomMapper::toResponse)
                .toList();
    }

    /**
     * 지정한 버전의 BOM 라인을 새 ACTIVE 버전으로 복원합니다.
     *
     * @param parentItemId 제품 품목 ID
     * @param versionId    복원할 BOM 버전 ID
     * @return 복원된 새 버전의 BOM 라인 목록
     * @throws BusinessException 버전이 없거나 해당 품목 소속이 아닌 경우
     */
    @Transactional
    public List<BomResponse> restore(Long parentItemId, Long versionId) {
        BomVersion targetVersion = bomVersionService.getVersion(versionId);
        if (!targetVersion.getParentItem().getId().equals(parentItemId)) {
            throw new BusinessException(ErrorCode.BOM_VERSION_ITEM_MISMATCH);
        }

        List<Bom> sourceLines = bomRepository.findByBomVersionIdIncludingDeleted(versionId);

        Item parentItem = itemService.getItem(parentItemId);
        softDeleteActiveLines(parentItemId);
        bomRepository.flush();

        BomVersion newVersion = bomVersionService.createNewVersion(parentItem);

        List<Bom> restoredLines = sourceLines.stream()
                .map(source -> Bom.builder()
                        .parentItem(parentItem)
                        .materialItem(source.getMaterialItem())
                        .bomVersion(newVersion)
                        .sequence(source.getSequence())
                        .quantity(source.getQuantity())
                        .description(source.getDescription())
                        .build())
                .toList();
        bomRepository.saveAll(restoredLines);

        log.info("BOM 버전 복원 완료: parentItemId={}, sourceVersionId={}, newVersionNo={}",
                parentItemId, versionId, newVersion.getVersionNo());

        return bomRepository.findByParentItemIdOrderBySequenceAsc(parentItemId).stream()
                .map(bomMapper::toResponse)
                .toList();
    }

    /**
     * 원본 품목의 BOM 구성을 여러 대상 품목에 일괄 복사합니다.
     * REPLACE 모드는 대상 품목의 기존 ACTIVE BOM을 새 버전으로 교체합니다.
     * APPEND 모드는 대상 품목의 현재 ACTIVE 버전에 원본 BOM을 이어서 추가한 새 버전을 생성합니다.
     *
     * @param request 복사 요청
     * @return 복사 결과
     * @throws BusinessException 대상 품목이 없거나, 원본과 대상이 같거나, 원본 BOM이 없는 경우
     */
    @Transactional
    public BomBulkCopyResponse bulkCopy(BomBulkCopyRequest request) {
        List<Long> targetIds = request.getTargetItemIds();

        if (targetIds == null || targetIds.isEmpty()) {
            throw new BusinessException(ErrorCode.BOM_COPY_TARGET_EMPTY);
        }
        if (targetIds.contains(request.getSourceItemId())) {
            throw new BusinessException(ErrorCode.BOM_COPY_SOURCE_TARGET_SAME);
        }

        List<Bom> sourceBoms = bomRepository.findByParentItemIdOrderBySequenceAsc(request.getSourceItemId());
        if (sourceBoms.isEmpty()) {
            throw new BusinessException(ErrorCode.BOM_COPY_EMPTY_SOURCE);
        }

        List<Item> targetItems = targetIds.stream()
                .map(itemService::getItem)
                .toList();

        for (Item targetItem : targetItems) {
            if (request.getMode() == BomCopyMode.REPLACE) {
                copyReplace(targetItem, sourceBoms);
            } else {
                copyAppend(targetItem, sourceBoms);
            }
        }

        log.info("BOM 일괄 복사 완료: sourceItemId={}, mode={}, targetCount={}",
                request.getSourceItemId(), request.getMode(), targetIds.size());

        return BomBulkCopyResponse.builder()
                .sourceItemId(request.getSourceItemId())
                .targetCount(targetIds.size())
                .copiedCount(targetIds.size())
                .build();
    }

    /**
     * ID로 BOM 엔티티를 조회합니다.
     *
     * @param id BOM ID
     * @return BOM 엔티티
     * @throws BusinessException BOM이 존재하지 않을 경우
     */
    public Bom getBom(Long id) {
        return bomRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOM_NOT_FOUND, String.valueOf(id)));
    }

    private void copyReplace(Item targetItem, List<Bom> sourceBoms) {
        softDeleteActiveLines(targetItem.getId());
        bomRepository.flush();

        BomVersion newVersion = bomVersionService.createNewVersion(targetItem);
        List<Bom> copies = sourceBoms.stream()
                .map(source -> {
                    validateSelfReference(targetItem.getId(), source.getMaterialItem().getId());
                    return Bom.builder()
                            .parentItem(targetItem)
                            .materialItem(source.getMaterialItem())
                            .bomVersion(newVersion)
                            .sequence(source.getSequence())
                            .quantity(source.getQuantity())
                            .description(source.getDescription())
                            .build();
                })
                .toList();
        bomRepository.saveAll(copies);
    }

    private void copyAppend(Item targetItem, List<Bom> sourceBoms) {
        List<Bom> existingLines = bomRepository.findByParentItemIdOrderBySequenceAsc(targetItem.getId());
        int offset = existingLines.stream()
                .mapToInt(Bom::getSequence)
                .max()
                .orElse(0);

        List<Long> existingMaterialIds = existingLines.stream()
                .map(bom -> bom.getMaterialItem().getId())
                .toList();

        for (Bom source : sourceBoms) {
            if (existingMaterialIds.contains(source.getMaterialItem().getId())) {
                throw new BusinessException(ErrorCode.BOM_DUPLICATED);
            }
            validateSelfReference(targetItem.getId(), source.getMaterialItem().getId());
        }

        softDeleteActiveLines(targetItem.getId());
        bomRepository.flush();

        BomVersion newVersion = bomVersionService.createNewVersion(targetItem);

        List<Bom> existingCopies = existingLines.stream()
                .map(line -> Bom.builder()
                        .parentItem(targetItem)
                        .materialItem(line.getMaterialItem())
                        .bomVersion(newVersion)
                        .sequence(line.getSequence())
                        .quantity(line.getQuantity())
                        .description(line.getDescription())
                        .build())
                .toList();

        List<Bom> appendedCopies = sourceBoms.stream()
                .map(source -> Bom.builder()
                        .parentItem(targetItem)
                        .materialItem(source.getMaterialItem())
                        .bomVersion(newVersion)
                        .sequence(source.getSequence() + offset)
                        .quantity(source.getQuantity())
                        .description(source.getDescription())
                        .build())
                .toList();

        bomRepository.saveAll(existingCopies);
        bomRepository.saveAll(appendedCopies);
    }

    private void softDeleteActiveLines(Long parentItemId) {
        bomRepository.findByParentItemIdOrderBySequenceAsc(parentItemId)
                .forEach(Bom::delete);
    }

    private Bom buildLine(Item parentItem, BomVersion version, BomSaveRequest.BomLineRequest line) {
        Item materialItem = itemService.getItem(line.getMaterialItemId());
        return Bom.builder()
                .parentItem(parentItem)
                .materialItem(materialItem)
                .bomVersion(version)
                .sequence(line.getSequence())
                .quantity(line.getQuantity())
                .description(line.getDescription())
                .build();
    }

    private void validateLines(Long parentItemId, List<BomSaveRequest.BomLineRequest> lines) {
        lines.forEach(line -> {
            validateQuantity(line.getQuantity());
            validateSelfReference(parentItemId, line.getMaterialItemId());
        });

        long distinctMaterials = lines.stream()
                .map(BomSaveRequest.BomLineRequest::getMaterialItemId)
                .distinct()
                .count();
        if (distinctMaterials < lines.size()) {
            throw new BusinessException(ErrorCode.BOM_DUPLICATED);
        }

        long distinctSequences = lines.stream()
                .map(BomSaveRequest.BomLineRequest::getSequence)
                .distinct()
                .count();
        if (distinctSequences < lines.size()) {
            throw new BusinessException(ErrorCode.BOM_SEQUENCE_DUPLICATED);
        }
    }

    private void validateQuantity(BigDecimal quantity) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.BOM_QUANTITY_INVALID);
        }
    }

    private void validateSelfReference(Long parentItemId, Long materialItemId) {
        if (parentItemId != null && parentItemId.equals(materialItemId)) {
            throw new BusinessException(ErrorCode.BOM_SELF_REFERENCE);
        }
    }
}
