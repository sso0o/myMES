package com.mymes.backend.inspectionitem.entity;

import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "inspection_items")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InspectionItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_item_code", nullable = false, unique = true, length = 50)
    private String inspectionItemCode;

    @Column(name = "inspection_item_name", nullable = false, length = 100)
    private String inspectionItemName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CommonCode category;

    @Enumerated(EnumType.STRING)
    @Column(name = "measurement_type", nullable = false, length = 20)
    private MeasurementType measurementType;

    @Column(length = 20)
    private String unit;

    @Column(name = "decimal_scale")
    private Integer decimalScale;

    @Column(length = 500)
    private String description;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Builder
    public InspectionItem(String inspectionItemCode, String inspectionItemName, CommonCode category,
                          MeasurementType measurementType, String unit, Integer decimalScale,
                          String description, Integer sortOrder, Boolean isActive) {
        this.inspectionItemCode = inspectionItemCode;
        this.inspectionItemName = inspectionItemName;
        this.category = category;
        this.measurementType = measurementType;
        this.unit = unit;
        this.decimalScale = decimalScale;
        this.description = description;
        this.sortOrder = sortOrder == null ? 0 : sortOrder;
        this.isActive = isActive == null || isActive;
    }

    /**
     * 검사항목 마스터 정보를 수정합니다.
     *
     * @param inspectionItemName 검사항목명
     * @param category           검사항목 분류 공통코드
     * @param measurementType    측정방식
     * @param unit               단위
     * @param decimalScale       소수점 자리수
     * @param description        설명
     * @param sortOrder          정렬순서
     * @param isActive           사용여부
     */
    public void update(String inspectionItemName, CommonCode category, MeasurementType measurementType,
                       String unit, Integer decimalScale, String description, Integer sortOrder,
                       boolean isActive) {
        this.inspectionItemName = inspectionItemName;
        this.category = category;
        this.measurementType = measurementType;
        this.unit = unit;
        this.decimalScale = decimalScale;
        this.description = description;
        this.sortOrder = sortOrder == null ? 0 : sortOrder;
        this.isActive = isActive;
    }
}
