package com.mymes.backend.itemprocess.entity;

import com.mymes.backend.common.entity.BaseEntity;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.process.entity.MfgProcess;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "item_processes",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"item_id", "process_id"}),
                @UniqueConstraint(columnNames = {"item_id", "sequence"})
        })
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ItemProcess extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private MfgProcess process;

    @Column(nullable = false)
    private Integer sequence;

    @Builder
    public ItemProcess(Item item, MfgProcess process, Integer sequence) {
        this.item = item;
        this.process = process;
        this.sequence = sequence;
    }

    public void update(MfgProcess process, Integer sequence) {
        this.process = process;
        this.sequence = sequence;
    }
}
