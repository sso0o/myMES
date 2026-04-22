package com.mymes.backend.defect.repository;

import com.mymes.backend.defect.entity.DefectRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DefectRepository extends JpaRepository<DefectRecord, Long> {
    List<DefectRecord> findByWorkOrderIdOrderByCreatedAtDesc(Long workOrderId);
}
