package com.mymes.backend.item.entity;

import com.mymes.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "items")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Item extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_code", nullable = false, unique = true, length = 50)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    @Column(nullable = false, length = 20)
    private String unit;

    @Builder
    public Item(String itemCode, String itemName, String unit) {
        this.itemCode = itemCode;
        this.itemName = itemName;
        this.unit = unit;
    }

    public void update(String itemCode, String itemName, String unit) {
        this.itemCode = itemCode;
        this.itemName = itemName;
        this.unit = unit;
    }
}
