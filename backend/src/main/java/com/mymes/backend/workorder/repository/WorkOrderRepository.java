package com.mymes.backend.workorder.repository;

import com.mymes.backend.workorder.entity.WorkOrderStatus;
import com.mymes.backend.workorder.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    List<WorkOrder> findByStatusOrderByDueDateAsc(WorkOrderStatus status);

    List<WorkOrder> findByDueDateBeforeAndStatusNotOrderByDueDateAsc(LocalDate today, WorkOrderStatus status);

    boolean existsByWorkOrderNo(String workOrderNo);

    // 소프트 삭제된 행도 포함해 채번 중복을 방지하기 위해 native query 사용
    @Query(value = "SELECT work_order_no FROM work_orders WHERE work_order_no LIKE CONCAT(:prefix, '%') ORDER BY work_order_no DESC LIMIT 1", nativeQuery = true)
    Optional<String> findLatestWorkOrderNoByPrefix(@Param("prefix") String prefix);
}
