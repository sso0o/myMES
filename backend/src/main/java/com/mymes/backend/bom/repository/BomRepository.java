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

    boolean existsByParentItemIdAndMaterialItemIdAndIdNot(Long parentItemId, Long materialItemId, Long id);

    boolean existsByParentItemIdAndSequenceAndIdNot(Long parentItemId, Integer sequence, Long id);

    @Query("SELECT MAX(b.sequence) FROM Bom b WHERE b.parentItem.id = :parentItemId")
    Integer findMaxSequenceByParentItemId(@Param("parentItemId") Long parentItemId);
}
