package com.mymes.backend.process.entity;

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

@Entity
@Table(name = "processes")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Access(AccessType.FIELD)
public class MfgProcess extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "process_code", nullable = false, unique = true, length = 50)
    private String processCode;

    @Column(name = "process_name", nullable = false, length = 100)
    private String processName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_type_id")
    private CommonCode processType;

    @Column(name = "standard_time")
    private Integer standardTime;

    @Column(length = 500)
    private String description;

    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private boolean isActive = true;

    @Builder
    public MfgProcess(String processCode, String processName, CommonCode processType,
                      Integer standardTime, String description, Boolean isActive) {
        this.processCode = processCode;
        this.processName = processName;
        this.processType = processType;
        this.standardTime = standardTime;
        this.description = description;
        this.isActive = isActive == null || isActive;
    }

    /**
     * 공정 정보를 수정합니다.
     *
     * @param processName  공정명
     * @param processType  공정유형 (공통코드)
     * @param standardTime 표준시간(분)
     * @param description  설명
     * @param isActive     사용여부
     */
    public void update(String processName, CommonCode processType, Integer standardTime,
                       String description, boolean isActive) {
        this.processName = processName;
        this.processType = processType;
        this.standardTime = standardTime;
        this.description = description;
        this.isActive = isActive;
    }
}
