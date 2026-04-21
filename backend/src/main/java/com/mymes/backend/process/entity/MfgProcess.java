package com.mymes.backend.process.entity;

import com.mymes.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "processes")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MfgProcess extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "process_code", nullable = false, unique = true, length = 50)
    private String processCode;

    @Column(name = "process_name", nullable = false, length = 100)
    private String processName;

    @Column(nullable = false)
    private Integer sequence;

    @Builder
    public MfgProcess(String processCode, String processName, Integer sequence) {
        this.processCode = processCode;
        this.processName = processName;
        this.sequence = sequence;
    }

    public void update(String processCode, String processName, Integer sequence) {
        this.processCode = processCode;
        this.processName = processName;
        this.sequence = sequence;
    }
}
