package com.mymes.backend.inspectionitem.service;

import com.mymes.backend.code.entity.CodeGroup;
import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.code.repository.CodeGroupRepository;
import com.mymes.backend.code.repository.CommonCodeRepository;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.inspectionitem.dto.InspectionItemCreateRequest;
import com.mymes.backend.inspectionitem.dto.InspectionItemResponse;
import com.mymes.backend.inspectionitem.dto.InspectionItemUpdateRequest;
import com.mymes.backend.inspectionitem.entity.InspectionItem;
import com.mymes.backend.inspectionitem.mapper.InspectionItemMapper;
import com.mymes.backend.inspectionitem.repository.InspectionItemRepository;
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
public class InspectionItemService {

    private static final String INSPECTION_ITEM_CATEGORY_GROUP_ID = "QC_INSPECTION_ITEM";
    private static final int MAX_INSPECTION_ITEM_CODE_RETRIES = 3;

    private final InspectionItemRepository inspectionItemRepository;
    private final InspectionItemMapper inspectionItemMapper;
    private final CodeGroupRepository codeGroupRepository;
    private final CommonCodeRepository commonCodeRepository;

    /**
     * 전체 검사항목 마스터 목록을 정렬순서, 코드 오름차순으로 조회합니다.
     *
     * @return 검사항목 마스터 응답 목록
     */
    public List<InspectionItemResponse> findAll() {
        return inspectionItemRepository.findAllByOrderBySortOrderAscInspectionItemCodeAsc().stream()
                .map(inspectionItemMapper::toResponse)
                .toList();
    }

    /**
     * ID로 검사항목 마스터를 단건 조회합니다.
     *
     * @param id 검사항목 마스터 ID
     * @return 검사항목 마스터 응답 DTO
     * @throws BusinessException 검사항목 마스터가 존재하지 않을 경우
     */
    public InspectionItemResponse findById(Long id) {
        return inspectionItemMapper.toResponse(getInspectionItem(id));
    }

    /**
     * 새 검사항목 마스터를 등록합니다.
     *
     * @param request 검사항목 마스터 생성 요청 DTO
     * @return 생성된 검사항목 마스터 응답 DTO
     * @throws BusinessException 분류 코드가 존재하지 않거나 채번코드가 없을 경우
     */
    @Transactional
    public InspectionItemResponse create(InspectionItemCreateRequest request) {
        CommonCode category = resolveCategory(request.getCategoryCode());

        for (int attempt = 1; attempt <= MAX_INSPECTION_ITEM_CODE_RETRIES; attempt++) {
            String inspectionItemCode = generateInspectionItemCode(category);
            InspectionItem inspectionItem = InspectionItem.builder()
                    .inspectionItemCode(inspectionItemCode)
                    .inspectionItemName(request.getInspectionItemName())
                    .category(category)
                    .measurementType(request.getMeasurementType())
                    .unit(request.getUnit())
                    .decimalScale(request.getDecimalScale())
                    .description(request.getDescription())
                    .sortOrder(request.getSortOrder())
                    .isActive(request.isActive())
                    .build();

            try {
                InspectionItem saved = inspectionItemRepository.saveAndFlush(inspectionItem);
                log.info("검사항목 마스터 생성 완료: id={}, code={}", saved.getId(), saved.getInspectionItemCode());
                return inspectionItemMapper.toResponse(saved);
            } catch (DataIntegrityViolationException e) {
                log.warn("검사항목 코드 충돌로 재시도합니다. attempt={}, inspectionItemCode={}",
                        attempt, inspectionItemCode);
                if (attempt == MAX_INSPECTION_ITEM_CODE_RETRIES) {
                    throw new BusinessException(ErrorCode.INSPECTION_ITEM_CODE_GENERATION_FAILED);
                }
            }
        }

        throw new BusinessException(ErrorCode.INSPECTION_ITEM_CODE_GENERATION_FAILED);
    }

    /**
     * 검사항목 마스터 정보를 수정합니다.
     *
     * @param id      검사항목 마스터 ID
     * @param request 검사항목 마스터 수정 요청 DTO
     * @return 수정된 검사항목 마스터 응답 DTO
     * @throws BusinessException 검사항목 마스터 또는 분류 코드가 존재하지 않을 경우
     */
    @Transactional
    public InspectionItemResponse update(Long id, InspectionItemUpdateRequest request) {
        InspectionItem inspectionItem = getInspectionItem(id);
        CommonCode category = resolveCategory(request.getCategoryCode());
        inspectionItem.update(
                request.getInspectionItemName(),
                category,
                request.getMeasurementType(),
                request.getUnit(),
                request.getDecimalScale(),
                request.getDescription(),
                request.getSortOrder(),
                request.isActive()
        );
        log.info("검사항목 마스터 수정 완료: id={}", id);
        return inspectionItemMapper.toResponse(inspectionItem);
    }

    /**
     * 검사항목 마스터를 소프트 삭제합니다.
     *
     * @param id 검사항목 마스터 ID
     * @throws BusinessException 검사항목 마스터가 존재하지 않을 경우
     */
    @Transactional
    public void delete(Long id) {
        InspectionItem inspectionItem = getInspectionItem(id);
        inspectionItem.delete();
        log.info("검사항목 마스터 삭제 완료: id={}", id);
    }

    /**
     * ID로 검사항목 마스터 엔티티를 조회합니다.
     *
     * @param id 검사항목 마스터 ID
     * @return 검사항목 마스터 엔티티
     * @throws BusinessException 검사항목 마스터가 존재하지 않을 경우
     */
    public InspectionItem getInspectionItem(Long id) {
        return inspectionItemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.INSPECTION_ITEM_NOT_FOUND, String.valueOf(id)));
    }

    private CommonCode resolveCategory(String categoryCode) {
        CodeGroup categoryGroup = codeGroupRepository.findByGroupId(INSPECTION_ITEM_CATEGORY_GROUP_ID)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.CODE_GROUP_NOT_FOUND,
                        INSPECTION_ITEM_CATEGORY_GROUP_ID
                ));
        return commonCodeRepository.findByCodeGroupAndCode(categoryGroup, categoryCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_CODE_NOT_FOUND, categoryCode));
    }

    private String generateInspectionItemCode(CommonCode category) {
        String numberingPrefix = category.getNumberingPrefix();
        if (numberingPrefix == null || numberingPrefix.isBlank()) {
            throw new BusinessException(ErrorCode.INSPECTION_ITEM_CATEGORY_PREFIX_REQUIRED);
        }

        String prefix = numberingPrefix.trim().toUpperCase() + "-";
        int nextSequence = inspectionItemRepository
                .findTopByInspectionItemCodeStartingWithOrderByInspectionItemCodeDesc(prefix)
                .map(item -> extractSequence(item.getInspectionItemCode()) + 1)
                .orElse(1);
        return prefix + String.format("%03d", nextSequence);
    }

    private int extractSequence(String inspectionItemCode) {
        int separatorIndex = inspectionItemCode.lastIndexOf('-');
        if (separatorIndex < 0 || separatorIndex == inspectionItemCode.length() - 1) {
            log.warn("검사항목 코드 시퀀스 추출 실패, 1부터 시작합니다. inspectionItemCode={}", inspectionItemCode);
            return 0;
        }
        try {
            return Integer.parseInt(inspectionItemCode.substring(separatorIndex + 1));
        } catch (NumberFormatException e) {
            log.warn("검사항목 코드 시퀀스 추출 실패, 1부터 시작합니다. inspectionItemCode={}", inspectionItemCode);
            return 0;
        }
    }
}
