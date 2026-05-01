package com.mymes.backend.equipment.entity;

import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.common.entity.BaseEntity;
import jakarta.persistence.Access;
import jakarta.persistence.AccessType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "equipment")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Access(AccessType.FIELD)
public class Equipment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "equipment_code", nullable = false, unique = true, length = 50)
    private String equipmentCode;

    @Column(name = "equipment_name", nullable = false, length = 100)
    private String equipmentName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_type_id")
    private CommonCode equipmentType;

    @Column(length = 200)
    private String location;

    @Column(length = 100)
    private String manufacturer;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(length = 500)
    private String description;

    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private boolean isActive = true;

    @Builder
    public Equipment(String equipmentCode, String equipmentName, CommonCode equipmentType,
                     String location, String manufacturer, String modelName,
                     LocalDate purchaseDate, String description, Boolean isActive) {
        this.equipmentCode = equipmentCode;
        this.equipmentName = equipmentName;
        this.equipmentType = equipmentType;
        this.location = location;
        this.manufacturer = manufacturer;
        this.modelName = modelName;
        this.purchaseDate = purchaseDate;
        this.description = description;
        this.isActive = isActive == null || isActive;
    }

    /**
     * 설비 정보를 수정합니다.
     *
     * @param equipmentName 설비명
     * @param equipmentType 설비유형 (공통코드)
     * @param location      위치
     * @param manufacturer  제조사
     * @param modelName     모델명
     * @param purchaseDate  구입일
     * @param description   설명
     * @param isActive      사용여부
     */
    public void update(String equipmentName, CommonCode equipmentType, String location,
                       String manufacturer, String modelName, LocalDate purchaseDate,
                       String description, boolean isActive) {
        this.equipmentName = equipmentName;
        this.equipmentType = equipmentType;
        this.location = location;
        this.manufacturer = manufacturer;
        this.modelName = modelName;
        this.purchaseDate = purchaseDate;
        this.description = description;
        this.isActive = isActive;
    }
}
