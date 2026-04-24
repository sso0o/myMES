package com.mymes.backend.planning.repository;

import com.mymes.backend.planning.entity.PlanStatus;
import com.mymes.backend.planning.entity.ProductionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductionPlanRepository extends JpaRepository<ProductionPlan, Long> {

    List<ProductionPlan> findByStatusOrderByPlannedDateAsc(PlanStatus status);

    // 소프트 삭제된 행도 포함해 채번 중복을 방지하기 위해 native query 사용
    @Query(value = "SELECT plan_no FROM production_plans WHERE plan_no LIKE CONCAT(:prefix, '%') ORDER BY plan_no DESC LIMIT 1", nativeQuery = true)
    Optional<String> findLatestPlanNoByPrefix(@Param("prefix") String prefix);
}
