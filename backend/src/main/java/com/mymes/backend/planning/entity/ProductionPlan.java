package com.mymes.backend.planning.entity;

import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.user.entity.User;
import com.mymes.backend.workorder.entity.WorkOrder;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "production_plans")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductionPlan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plan_no", nullable = false, unique = true, length = 30)
    private String planNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "planned_qty", nullable = false)
    private Integer plannedQty;

    @Column(name = "planned_date", nullable = false)
    private LocalDate plannedDate;

    @Column(name = "line_name", length = 50)
    private String lineName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PlanStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(length = 500)
    private String memo;

    @Builder
    public ProductionPlan(String planNo, Item item, Integer plannedQty,
                          LocalDate plannedDate, String lineName, User createdBy, String memo) {
        this.planNo = planNo;
        this.item = item;
        this.plannedQty = plannedQty;
        this.plannedDate = plannedDate;
        this.lineName = lineName;
        this.status = PlanStatus.DRAFT;
        this.createdBy = createdBy;
        this.memo = memo;
    }

    public void update(Item item, Integer plannedQty, LocalDate plannedDate, String lineName, String memo) {
        if (this.status != PlanStatus.DRAFT) {
            throw new BusinessException(ErrorCode.PLAN_NOT_MODIFIABLE);
        }
        this.item = item;
        this.plannedQty = plannedQty;
        this.plannedDate = plannedDate;
        this.lineName = lineName;
        this.memo = memo;
    }

    public void changeStatus(PlanStatus newStatus) {
        boolean valid = switch (this.status) {
            case DRAFT     -> newStatus == PlanStatus.CONFIRMED;
            case CONFIRMED -> newStatus == PlanStatus.RELEASED || newStatus == PlanStatus.DRAFT;
            case RELEASED  -> newStatus == PlanStatus.CLOSED;
            case CLOSED    -> false;
        };
        if (!valid) {
            throw new BusinessException(ErrorCode.PLAN_INVALID_STATUS_TRANSITION,
                    this.status + " → " + newStatus);
        }
        this.status = newStatus;
    }

    public void linkWorkOrder(WorkOrder workOrder) {
        this.workOrder = workOrder;
    }
}
