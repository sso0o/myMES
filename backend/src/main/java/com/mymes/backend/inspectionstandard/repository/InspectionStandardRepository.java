package com.mymes.backend.inspectionstandard.repository;

import com.mymes.backend.inspectionstandard.entity.InspectionStandard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InspectionStandardRepository extends JpaRepository<InspectionStandard, Long> {

    List<InspectionStandard> findAllByOrderByItem_ItemCodeAscProcess_ProcessCodeAscSortOrderAsc();

    List<InspectionStandard> findByItem_IdAndProcess_IdOrderBySortOrderAsc(Long itemId, Long processId);

    boolean existsByItem_IdAndProcess_IdAndInspectionItem_Id(Long itemId, Long processId, Long inspectionItemId);

    boolean existsByItem_IdAndProcess_IdAndIsActiveTrue(Long itemId, Long processId);

    List<InspectionStandard> findByItem_IdAndProcess_IdAndIsActiveTrueOrderBySortOrderAsc(Long itemId, Long processId);
}
