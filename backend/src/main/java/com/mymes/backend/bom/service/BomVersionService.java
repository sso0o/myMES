package com.mymes.backend.bom.service;

import com.mymes.backend.bom.dto.BomVersionResponse;
import com.mymes.backend.bom.entity.BomVersion;
import com.mymes.backend.bom.entity.BomVersionStatus;
import com.mymes.backend.bom.mapper.BomMapper;
import com.mymes.backend.bom.repository.BomVersionRepository;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.entity.Item;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BomVersionService {

    private final BomVersionRepository bomVersionRepository;
    private final BomMapper bomMapper;

    /**
     * 품목의 ACTIVE BOM 버전을 조회합니다.
     *
     * @param parentItemId 제품 품목 ID
     * @return ACTIVE 버전 (없을 수 있음)
     */
    public Optional<BomVersion> findActiveVersion(Long parentItemId) {
        return bomVersionRepository.findByParentItemIdAndStatus(parentItemId, BomVersionStatus.ACTIVE);
    }

    /**
     * 품목의 ACTIVE BOM 버전을 조회합니다.
     *
     * @param parentItemId 제품 품목 ID
     * @return ACTIVE 버전
     * @throws BusinessException ACTIVE 버전이 없을 경우
     */
    public BomVersion getActiveVersion(Long parentItemId) {
        return bomVersionRepository.findByParentItemIdAndStatus(parentItemId, BomVersionStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOM_VERSION_NO_ACTIVE));
    }

    /**
     * ID로 BOM 버전을 조회합니다.
     *
     * @param versionId BOM 버전 ID
     * @return BOM 버전 엔티티
     * @throws BusinessException BOM 버전이 존재하지 않을 경우
     */
    public BomVersion getVersion(Long versionId) {
        return bomVersionRepository.findById(versionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BOM_VERSION_NOT_FOUND));
    }

    /**
     * 품목의 모든 BOM 버전 이력을 버전 번호 내림차순으로 조회합니다.
     *
     * @param parentItemId 제품 품목 ID
     * @return BOM 버전 응답 목록
     */
    public List<BomVersionResponse> findAllVersions(Long parentItemId) {
        return bomVersionRepository.findByParentItemIdOrderByVersionNoDesc(parentItemId).stream()
                .map(bomMapper::toVersionResponse)
                .toList();
    }

    /**
     * 품목에 새 ACTIVE BOM 버전을 생성합니다.
     * 기존 ACTIVE 버전이 있으면 INACTIVE로 변경합니다.
     *
     * @param parentItem 제품 품목 엔티티
     * @return 생성된 새 BOM 버전
     */
    @Transactional
    public BomVersion createNewVersion(Item parentItem) {
        bomVersionRepository.findByParentItemIdAndStatus(parentItem.getId(), BomVersionStatus.ACTIVE)
                .ifPresent(BomVersion::deactivate);

        int nextVersionNo = bomVersionRepository.findMaxVersionNoByParentItemId(parentItem.getId()) + 1;

        BomVersion newVersion = BomVersion.builder()
                .parentItem(parentItem)
                .versionNo(nextVersionNo)
                .build();

        return bomVersionRepository.save(newVersion);
    }
}
