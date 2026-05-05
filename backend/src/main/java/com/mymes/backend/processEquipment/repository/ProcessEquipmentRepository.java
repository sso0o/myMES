package com.mymes.backend.processEquipment.repository;

import com.mymes.backend.processEquipment.entity.ProcessEquipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProcessEquipmentRepository extends JpaRepository<ProcessEquipment, Long> {

    List<ProcessEquipment> findByProcessIdOrderByIsPrimaryDescCreatedAtAsc(Long processId);

    List<ProcessEquipment> findByEquipmentIdOrderByIsPrimaryDescCreatedAtAsc(Long equipmentId);

    boolean existsByProcessIdAndEquipmentId(Long processId, Long equipmentId);

    boolean existsByProcessIdAndEquipmentIdAndIdNot(Long processId, Long equipmentId, Long id);
}
