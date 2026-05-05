package com.mymes.backend.bom.repository;

import com.mymes.backend.bom.entity.Bom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BomRepository extends JpaRepository<Bom, Long> {

    List<Bom> findByParentItemIdOrderBySequenceAsc(Long parentItemId);

    boolean existsByParentItemIdAndMaterialItemId(Long parentItemId, Long materialItemId);

    boolean existsByParentItemIdAndSequence(Long parentItemId, Integer sequence);

    boolean existsByParentItemIdAndMaterialItemIdAndBomVersionId(Long parentItemId, Long materialItemId, Long bomVersionId);

    boolean existsByParentItemIdAndSequenceAndBomVersionId(Long parentItemId, Integer sequence, Long bomVersionId);

    /**
     * 특정 BOM 버전에 속한 라인을 순서 오름차순으로 조회합니다.
     * 소프트 삭제된 라인 포함 조회 (이력 조회 및 버전 복원용 네이티브 쿼리).
     */
    @Query(value = "SELECT * FROM boms WHERE bom_version_id = :versionId ORDER BY sequence ASC", nativeQuery = true)
    List<Bom> findByBomVersionIdIncludingDeleted(@Param("versionId") Long versionId);
}
