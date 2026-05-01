package com.mymes.backend.itemprocess.repository;

import com.mymes.backend.itemprocess.entity.ItemProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ItemProcessRepository extends JpaRepository<ItemProcess, Long> {
    List<ItemProcess> findByItemIdOrderBySequenceAsc(Long itemId);

    // soft-deleted 행 포함하여 중복 검사 (deleted_at IS NULL 필터 우회)
    @Query(value = "SELECT EXISTS(SELECT 1 FROM item_processes WHERE item_id = :itemId AND process_id = :processId)", nativeQuery = true)
    boolean existsByItemIdAndProcessId(@Param("itemId") Long itemId, @Param("processId") Long processId);

    @Query(value = "SELECT EXISTS(SELECT 1 FROM item_processes WHERE item_id = :itemId AND sequence = :sequence)", nativeQuery = true)
    boolean existsByItemIdAndSequence(@Param("itemId") Long itemId, @Param("sequence") Integer sequence);

    @Query(value = "SELECT EXISTS(SELECT 1 FROM item_processes WHERE item_id = :itemId AND process_id = :processId AND id != :id)", nativeQuery = true)
    boolean existsByItemIdAndProcessIdAndIdNot(@Param("itemId") Long itemId, @Param("processId") Long processId, @Param("id") Long id);

    @Query(value = "SELECT EXISTS(SELECT 1 FROM item_processes WHERE item_id = :itemId AND sequence = :sequence AND id != :id)", nativeQuery = true)
    boolean existsByItemIdAndSequenceAndIdNot(@Param("itemId") Long itemId, @Param("sequence") Integer sequence, @Param("id") Long id);

    /**
     * 특정 품목의 현재 최대 순서를 반환합니다. (APPEND 모드 offset 계산용)
     * deleted_at IS NULL 조건은 @SQLRestriction 으로 자동 적용됩니다.
     */
    @Query("SELECT MAX(ip.sequence) FROM ItemProcess ip WHERE ip.item.id = :itemId")
    Optional<Integer> findMaxSequenceByItemId(@Param("itemId") Long itemId);

    /**
     * 특정 품목의 모든 공정 매핑을 물리 삭제합니다. (REPLACE 모드 전용)
     * REPLACE 후 재삽입 시 DB unique constraint 충돌을 방지하기 위해 hard delete 를 사용합니다.
     */
    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM item_processes WHERE item_id = :itemId", nativeQuery = true)
    void hardDeleteAllByItemId(@Param("itemId") Long itemId);
}
