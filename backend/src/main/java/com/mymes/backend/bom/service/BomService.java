package com.mymes.backend.bom.service;

import com.mymes.backend.bom.dto.BomCreateRequest;
import com.mymes.backend.bom.dto.BomResponse;
import com.mymes.backend.bom.dto.BomUpdateRequest;
import com.mymes.backend.bom.entity.Bom;
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

    /**
     * 제품 품목 ID로 BOM 목록을 순서 오름차순 조회합니다.
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
     * ID로 BOM을 단건 조회합니다.
     *
     * @param id BOM ID
     * @return BOM 응답 DTO
     * @throws BusinessException BOM이 존재하지 않을 경우
     */
    public BomResponse findById(Long id) {
        return bomMapper.toResponse(getBom(id));
    }

    /**
     * BOM 자재 구성을 생성합니다.
     *
     * @param request BOM 생성 요청
     * @return 생성된 BOM 응답 DTO
     * @throws BusinessException 자기 참조, 수량 오류, 중복 자재 또는 중복 순서인 경우
     */
    @Transactional
    public BomResponse create(BomCreateRequest request) {
        validateQuantity(request.getQuantity());
        validateSelfReference(request.getParentItemId(), request.getMaterialItemId());

        Item parentItem = itemService.getItem(request.getParentItemId());
        Item materialItem = itemService.getItem(request.getMaterialItemId());
        validateCreateDuplicate(request.getParentItemId(), request.getMaterialItemId(), request.getSequence());

        Bom bom = Bom.builder()
                .parentItem(parentItem)
                .materialItem(materialItem)
                .sequence(request.getSequence())
                .quantity(request.getQuantity())
                .description(request.getDescription())
                .build();

        Bom saved = bomRepository.save(bom);
        log.info("BOM 생성 완료: id={}, parentItemId={}, materialItemId={}",
                saved.getId(), parentItem.getId(), materialItem.getId());
        return bomMapper.toResponse(saved);
    }

    /**
     * BOM 자재 구성을 수정합니다.
     *
     * @param id BOM ID
     * @param request BOM 수정 요청
     * @return 수정된 BOM 응답 DTO
     * @throws BusinessException BOM이 없거나, 자기 참조, 수량 오류, 중복 자재 또는 중복 순서인 경우
     */
    @Transactional
    public BomResponse update(Long id, BomUpdateRequest request) {
        Bom bom = getBom(id);
        Long parentItemId = bom.getParentItem().getId();

        validateQuantity(request.getQuantity());
        validateSelfReference(parentItemId, request.getMaterialItemId());

        Item materialItem = itemService.getItem(request.getMaterialItemId());
        validateUpdateDuplicate(parentItemId, request.getMaterialItemId(), request.getSequence(), id);

        bom.update(materialItem, request.getSequence(), request.getQuantity(), request.getDescription());
        log.info("BOM 수정 완료: id={}", id);
        return bomMapper.toResponse(bom);
    }

    /**
     * BOM 자재 구성을 소프트 삭제합니다.
     *
     * @param id BOM ID
     * @throws BusinessException BOM이 존재하지 않을 경우
     */
    @Transactional
    public void delete(Long id) {
        Bom bom = getBom(id);
        bom.delete();
        log.info("BOM 삭제 완료: id={}", id);
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

    private void validateCreateDuplicate(Long parentItemId, Long materialItemId, Integer sequence) {
        if (bomRepository.existsByParentItemIdAndMaterialItemId(parentItemId, materialItemId)) {
            throw new BusinessException(ErrorCode.BOM_DUPLICATED);
        }
        if (bomRepository.existsByParentItemIdAndSequence(parentItemId, sequence)) {
            throw new BusinessException(ErrorCode.BOM_SEQUENCE_DUPLICATED);
        }
    }

    private void validateUpdateDuplicate(Long parentItemId, Long materialItemId, Integer sequence, Long id) {
        if (bomRepository.existsByParentItemIdAndMaterialItemIdAndIdNot(parentItemId, materialItemId, id)) {
            throw new BusinessException(ErrorCode.BOM_DUPLICATED);
        }
        if (bomRepository.existsByParentItemIdAndSequenceAndIdNot(parentItemId, sequence, id)) {
            throw new BusinessException(ErrorCode.BOM_SEQUENCE_DUPLICATED);
        }
    }
}
