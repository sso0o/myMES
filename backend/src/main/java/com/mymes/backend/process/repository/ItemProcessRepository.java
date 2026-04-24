package com.mymes.backend.process.repository;

import com.mymes.backend.process.entity.ItemProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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
}
