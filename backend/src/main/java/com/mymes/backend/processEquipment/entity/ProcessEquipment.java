package com.mymes.backend.processEquipment.entity;

import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.equipment.entity.Equipment;
import com.mymes.backend.process.entity.MfgProcess;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "process_equipment",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"process_id", "equipment_id"})
        })
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProcessEquipment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private MfgProcess process;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "is_primary", nullable = false, columnDefinition = "boolean default false")
    private boolean isPrimary = false;

    @Builder
    public ProcessEquipment(MfgProcess process, Equipment equipment, boolean isPrimary) {
        this.process = process;
        this.equipment = equipment;
        this.isPrimary = isPrimary;
    }

    /**
     * 주 설비 여부를 수정합니다.
     *
     * @param isPrimary 주 설비 여부
     */
    public void updateIsPrimary(boolean isPrimary) {
        this.isPrimary = isPrimary;
    }
}
