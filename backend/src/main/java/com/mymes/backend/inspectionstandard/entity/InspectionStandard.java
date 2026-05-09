package com.mymes.backend.inspectionstandard.entity;

import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.inspectionitem.entity.InspectionItem;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.process.entity.MfgProcess;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@Entity
@Table(
        name = "inspection_standards",
        uniqueConstraints = @UniqueConstraint(columnNames = {"item_id", "process_id", "inspection_item_id"})
)
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InspectionStandard extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private MfgProcess process;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_item_id", nullable = false)
    private InspectionItem inspectionItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_method_id", nullable = false)
    private CommonCode inspectionMethod;

    @Column(name = "standard_value", length = 100)
    private String standardValue;

    @Column(name = "lower_limit", precision = 19, scale = 4)
    private BigDecimal lowerLimit;

    @Column(name = "upper_limit", precision = 19, scale = 4)
    private BigDecimal upperLimit;

    @Column(length = 20)
    private String unit;

    @Column(name = "sample_qty")
    private Integer sampleQty;

    @Column(name = "is_required", nullable = false)
    private boolean isRequired;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(length = 500)
    private String description;

    @Builder
    public InspectionStandard(Item item, MfgProcess process, InspectionItem inspectionItem,
                              CommonCode inspectionMethod, String standardValue,
                              BigDecimal lowerLimit, BigDecimal upperLimit, String unit,
                              Integer sampleQty, Boolean isRequired, Integer sortOrder,
                              Boolean isActive, String description) {
        this.item = item;
        this.process = process;
        this.inspectionItem = inspectionItem;
        this.inspectionMethod = inspectionMethod;
        this.standardValue = standardValue;
        this.lowerLimit = lowerLimit;
        this.upperLimit = upperLimit;
        this.unit = unit;
        this.sampleQty = sampleQty;
        this.isRequired = isRequired == null || isRequired;
        this.sortOrder = sortOrder == null ? 0 : sortOrder;
        this.isActive = isActive == null || isActive;
        this.description = description;
    }

    /**
     * 검사 기준 정보를 수정합니다.
     *
     * @param inspectionMethod 검사방식 공통코드
     * @param standardValue    기준값 또는 기준 문구
     * @param lowerLimit       하한값
     * @param upperLimit       상한값
     * @param unit             단위
     * @param sampleQty        샘플수
     * @param isRequired       필수 여부
     * @param sortOrder        정렬순서
     * @param isActive         사용여부
     * @param description      설명
     */
    public void update(CommonCode inspectionMethod, String standardValue,
                       BigDecimal lowerLimit, BigDecimal upperLimit, String unit,
                       Integer sampleQty, boolean isRequired, Integer sortOrder,
                       boolean isActive, String description) {
        this.inspectionMethod = inspectionMethod;
        this.standardValue = standardValue;
        this.lowerLimit = lowerLimit;
        this.upperLimit = upperLimit;
        this.unit = unit;
        this.sampleQty = sampleQty;
        this.isRequired = isRequired;
        this.sortOrder = sortOrder == null ? 0 : sortOrder;
        this.isActive = isActive;
        this.description = description;
    }
}
