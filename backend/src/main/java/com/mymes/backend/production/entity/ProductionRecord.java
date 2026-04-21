package com.mymes.backend.production.entity;

import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.workorder.entity.WorkOrder;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "production_records")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductionRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private MfgProcess process;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "input_qty", nullable = false)
    private Integer inputQty;

    @Column(name = "completed_qty", nullable = false)
    private Integer completedQty;

    @Column(name = "defect_qty", nullable = false)
    private Integer defectQty;

    @Builder
    public ProductionRecord(WorkOrder workOrder, MfgProcess process,
                            LocalDateTime startedAt, LocalDateTime endedAt,
                            Integer inputQty, Integer completedQty, Integer defectQty) {
        this.workOrder = workOrder;
        this.process = process;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.inputQty = inputQty;
        this.completedQty = completedQty;
        this.defectQty = defectQty != null ? defectQty : 0;
    }

    public void update(MfgProcess process, LocalDateTime startedAt, LocalDateTime endedAt,
                       Integer inputQty, Integer completedQty, Integer defectQty) {
        this.process = process;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.inputQty = inputQty;
        this.completedQty = completedQty;
        this.defectQty = defectQty != null ? defectQty : 0;
    }
}
