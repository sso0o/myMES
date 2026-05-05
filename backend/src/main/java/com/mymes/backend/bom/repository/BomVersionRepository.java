package com.mymes.backend.bom.repository;

import com.mymes.backend.bom.entity.BomVersion;
import com.mymes.backend.bom.entity.BomVersionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BomVersionRepository extends JpaRepository<BomVersion, Long> {

    Optional<BomVersion> findByParentItemIdAndStatus(Long parentItemId, BomVersionStatus status);

    List<BomVersion> findByParentItemIdOrderByVersionNoDesc(Long parentItemId);

    /**
     * 소프트 삭제된 레코드를 포함해 해당 품목의 최대 버전 번호를 조회합니다.
     * 채번 시 이전 번호 재사용 방지를 위해 사용합니다.
     */
    @Query(value = "SELECT COALESCE(MAX(version_no), 0) FROM bom_versions WHERE parent_item_id = :parentItemId", nativeQuery = true)
    Integer findMaxVersionNoByParentItemId(@Param("parentItemId") Long parentItemId);
}
