package com.mymes.backend.quality.repository;

import com.mymes.backend.quality.entity.QualityInspection;
import com.mymes.backend.quality.entity.QualityInspectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QualityInspectionRepository extends JpaRepository<QualityInspection, Long> {

    List<QualityInspection> findAllByOrderByInspectionDateDescIdDesc();

    List<QualityInspection> findByStatusOrderByInspectionDateDescIdDesc(QualityInspectionStatus status);

    @Query(value = "SELECT inspection_no FROM quality_inspections WHERE inspection_no LIKE CONCAT(:prefix, '%') ORDER BY inspection_no DESC LIMIT 1", nativeQuery = true)
    Optional<String> findLatestInspectionNoByPrefix(@Param("prefix") String prefix);
}
