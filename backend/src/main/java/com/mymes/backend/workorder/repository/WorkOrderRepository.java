package com.mymes.backend.workorder.repository;

import com.mymes.backend.workorder.entity.WorkOrderStatus;
import com.mymes.backend.workorder.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    List<WorkOrder> findByStatusOrderByDueDateAsc(WorkOrderStatus status);

    List<WorkOrder> findByDueDateBeforeAndStatusNotOrderByDueDateAsc(LocalDate today, WorkOrderStatus status);

    boolean existsByWorkOrderNo(String workOrderNo);
}
