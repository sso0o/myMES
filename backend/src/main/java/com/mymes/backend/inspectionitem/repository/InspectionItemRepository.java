package com.mymes.backend.inspectionitem.repository;

import com.mymes.backend.inspectionitem.entity.InspectionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InspectionItemRepository extends JpaRepository<InspectionItem, Long> {

    List<InspectionItem> findAllByOrderBySortOrderAscInspectionItemCodeAsc();

    Optional<InspectionItem> findTopByInspectionItemCodeStartingWithOrderByInspectionItemCodeDesc(String prefix);
}
