package com.mymes.backend.bom.entity;

import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.item.entity.Item;
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

import java.math.BigDecimal;

@Entity
@Table(name = "boms")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Bom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_item_id", nullable = false)
    private Item parentItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_item_id", nullable = false)
    private Item materialItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_version_id") // NOT NULL은 BomIndexConfig 마이그레이션에서 적용
    private BomVersion bomVersion;

    @Column(nullable = false)
    private Integer sequence;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal quantity;

    @Column(length = 500)
    private String description;

    @Builder
    public Bom(Item parentItem, Item materialItem, BomVersion bomVersion,
               Integer sequence, BigDecimal quantity, String description) {
        this.parentItem = parentItem;
        this.materialItem = materialItem;
        this.bomVersion = bomVersion;
        this.sequence = sequence;
        this.quantity = quantity;
        this.description = description;
    }
}
