package com.mymes.backend.production.repository;

import com.mymes.backend.production.entity.ProductionRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductionRepository extends JpaRepository<ProductionRecord, Long> {
    List<ProductionRecord> findByWorkOrderIdOrderByCreatedAtAsc(Long workOrderId);
}
