package com.mymes.backend.workorder.entity;

import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.process.entity.MfgProcess;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "work_orders")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "work_order_no", nullable = false, unique = true, length = 30)
    private String workOrderNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "planned_qty", nullable = false)
    private Integer plannedQty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkOrderStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private MfgProcess process;

    @Column(name = "worker_name", length = 50)
    private String workerName;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Builder
    public WorkOrder(String workOrderNo, Item item, Integer plannedQty,
                     Priority priority, MfgProcess process, String workerName, LocalDate dueDate) {
        this.workOrderNo = workOrderNo;
        this.item = item;
        this.plannedQty = plannedQty;
        this.priority = priority;
        this.status = WorkOrderStatus.WAITING;
        this.process = process;
        this.workerName = workerName;
        this.dueDate = dueDate;
    }

    public void update(Item item, Integer plannedQty, Priority priority,
                       MfgProcess process, String workerName, LocalDate dueDate) {
        this.item = item;
        this.plannedQty = plannedQty;
        this.priority = priority;
        this.process = process;
        this.workerName = workerName;
        this.dueDate = dueDate;
    }

    public void changeStatus(WorkOrderStatus newStatus) {
        boolean valid = switch (this.status) {
            case WAITING     -> newStatus == WorkOrderStatus.IN_PROGRESS;
            case IN_PROGRESS -> newStatus == WorkOrderStatus.COMPLETED;
            case COMPLETED   -> false;
        };
        if (!valid) {
            throw new BusinessException(ErrorCode.WORK_ORDER_INVALID_STATUS_TRANSITION,
                    this.status + " → " + newStatus);
        }
        this.status = newStatus;
    }
}
