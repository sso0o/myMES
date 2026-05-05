package com.mymes.backend.bom.entity;

import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.item.entity.Item;
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

@Entity
@Table(name = "bom_versions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BomVersion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_item_id", nullable = false)
    private Item parentItem;

    @Column(name = "version_no", nullable = false)
    private Integer versionNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BomVersionStatus status;

    @Builder
    public BomVersion(Item parentItem, Integer versionNo) {
        this.parentItem = parentItem;
        this.versionNo = versionNo;
        this.status = BomVersionStatus.ACTIVE;
    }

    /**
     * 이 버전을 비활성(INACTIVE) 상태로 변경합니다.
     */
    public void deactivate() {
        this.status = BomVersionStatus.INACTIVE;
    }
}
