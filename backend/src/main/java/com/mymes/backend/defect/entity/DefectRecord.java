package com.mymes.backend.defect.entity;

import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.defect.entity.DefectAction;
import com.mymes.backend.production.entity.ProductionRecord;
import com.mymes.backend.workorder.entity.WorkOrder;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "defect_records")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DefectRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_record_id")
    private ProductionRecord productionRecord;

    @Column(name = "defect_type", nullable = false, length = 50)
    private String defectType;

    @Column(nullable = false)
    private Integer qty;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_status", nullable = false, length = 20)
    private DefectAction actionStatus;

    @Column(name = "cause_memo", length = 500)
    private String causeMemo;

    @Builder
    public DefectRecord(WorkOrder workOrder, ProductionRecord productionRecord,
                        String defectType, Integer qty, String causeMemo) {
        this.workOrder = workOrder;
        this.productionRecord = productionRecord;
        this.defectType = defectType;
        this.qty = qty;
        this.actionStatus = DefectAction.WAITING;
        this.causeMemo = causeMemo;
    }

    public void updateAction(DefectAction actionStatus) {
        this.actionStatus = actionStatus;
    }
}
