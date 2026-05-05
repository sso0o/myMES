package com.mymes.backend.quality.entity;

import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.workorder.entity.WorkOrder;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "quality_inspections")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QualityInspection extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_no", nullable = false, unique = true, length = 30)
    private String inspectionNo;

    @Column(name = "inspection_date", nullable = false)
    private LocalDate inspectionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_type", nullable = false, length = 20)
    private QualityInspectionType inspectionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QualityInspectionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QualityInspectionResult result;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    private MfgProcess process;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @Column(name = "inspection_qty", nullable = false)
    private Integer inspectionQty;

    @Column(name = "pass_qty", nullable = false)
    private Integer passQty;

    @Column(name = "defect_qty", nullable = false)
    private Integer defectQty;

    @Column(name = "inspector_name", length = 50)
    private String inspectorName;

    @Column(length = 500)
    private String remarks;

    @Builder
    public QualityInspection(String inspectionNo, LocalDate inspectionDate,
                             QualityInspectionType inspectionType, QualityInspectionStatus status,
                             QualityInspectionResult result, Item item, MfgProcess process,
                             WorkOrder workOrder, Integer inspectionQty, Integer passQty,
                             Integer defectQty, String inspectorName, String remarks) {
        this.inspectionNo = inspectionNo;
        this.inspectionDate = inspectionDate;
        this.inspectionType = inspectionType;
        this.status = status == null ? QualityInspectionStatus.WAITING : status;
        this.result = result == null ? QualityInspectionResult.HOLD : result;
        this.item = item;
        this.process = process;
        this.workOrder = workOrder;
        this.inspectionQty = inspectionQty;
        this.passQty = passQty;
        this.defectQty = defectQty;
        this.inspectorName = inspectorName;
        this.remarks = remarks;
    }

    /**
     * 품질검사 기본 정보와 판정 결과를 수정합니다.
     *
     * @param inspectionDate 검사일자
     * @param inspectionType 검사유형
     * @param status 검사상태
     * @param result 판정결과
     * @param item 품목
     * @param process 공정
     * @param workOrder 작업지시
     * @param inspectionQty 검사수량
     * @param passQty 합격수량
     * @param defectQty 불량수량
     * @param inspectorName 검사자명
     * @param remarks 비고
     */
    public void update(LocalDate inspectionDate, QualityInspectionType inspectionType,
                       QualityInspectionStatus status, QualityInspectionResult result,
                       Item item, MfgProcess process, WorkOrder workOrder,
                       Integer inspectionQty, Integer passQty, Integer defectQty,
                       String inspectorName, String remarks) {
        this.inspectionDate = inspectionDate;
        this.inspectionType = inspectionType;
        this.status = status;
        this.result = result;
        this.item = item;
        this.process = process;
        this.workOrder = workOrder;
        this.inspectionQty = inspectionQty;
        this.passQty = passQty;
        this.defectQty = defectQty;
        this.inspectorName = inspectorName;
        this.remarks = remarks;
    }
}
