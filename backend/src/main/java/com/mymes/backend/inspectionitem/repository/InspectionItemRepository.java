package com.mymes.backend.inspectionitem.repository;

import com.mymes.backend.inspectionitem.entity.InspectionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InspectionItemRepository extends JpaRepository<InspectionItem, Long> {

    List<InspectionItem> findAllByOrderBySortOrderAscInspectionItemCodeAsc();

    boolean existsByInspectionItemCode(String inspectionItemCode);

    boolean existsByInspectionItemCodeAndIdNot(String inspectionItemCode, Long id);
}
