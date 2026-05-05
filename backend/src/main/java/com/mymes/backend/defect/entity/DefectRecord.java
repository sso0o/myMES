package com.mymes.backend.defect.entity;

import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.production.entity.ProductionRecord;
import com.mymes.backend.quality.entity.QualityInspection;
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
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_record_id")
    private ProductionRecord productionRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quality_inspection_id")
    private QualityInspection qualityInspection;

    @Column(name = "defect_type", nullable = false, length = 50)
    private String defectType;

    @Column(nullable = false)
    private Integer qty;

    @Column(name = "defect_description", length = 500)
    private String defectDescription;

    @Column(name = "cause_category", length = 50)
    private String causeCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_status", nullable = false, length = 20)
    private DefectAction actionStatus;

    @Column(name = "cause_memo", length = 500)
    private String causeMemo;

    @Column(name = "action_memo", length = 500)
    private String actionMemo;

    @Column(length = 20)
    private String disposition;

    @Column(name = "assignee_name", length = 50)
    private String assigneeName;

    @Builder
    public DefectRecord(WorkOrder workOrder, ProductionRecord productionRecord,
                        QualityInspection qualityInspection, String defectType, Integer qty,
                        String defectDescription, String causeCategory, String causeMemo,
                        String actionMemo, String disposition, String assigneeName) {
        this.workOrder = workOrder;
        this.productionRecord = productionRecord;
        this.qualityInspection = qualityInspection;
        this.defectType = defectType;
        this.qty = qty;
        this.defectDescription = defectDescription;
        this.causeCategory = causeCategory;
        this.actionStatus = DefectAction.WAITING;
        this.causeMemo = causeMemo;
        this.actionMemo = actionMemo;
        this.disposition = disposition;
        this.assigneeName = assigneeName;
    }

    /**
     * 불량 조치 정보를 수정합니다.
     *
     * @param actionStatus 조치상태
     * @param actionMemo 조치내용
     * @param disposition 처리방식
     * @param assigneeName 담당자명
     */
    public void updateAction(DefectAction actionStatus, String actionMemo,
                             String disposition, String assigneeName) {
        this.actionStatus = actionStatus;
        this.actionMemo = actionMemo;
        this.disposition = disposition;
        this.assigneeName = assigneeName;
    }
}
