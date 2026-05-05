package com.mymes.backend.worker.entity;

import com.mymes.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "workers")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Worker extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "worker_code", nullable = false, unique = true, length = 20)
    private String workerCode;

    @Column(name = "worker_name", nullable = false, length = 50)
    private String workerName;

    @Column(length = 30)
    private String phone;

    @Column(length = 100)
    private String department;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkerStatus status = WorkerStatus.ACTIVE;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "resigned_at")
    private LocalDate resignedAt;

    @Column(length = 500)
    private String description;

    @Builder
    public Worker(String workerCode, String workerName, String phone, String department,
                  String jobTitle, WorkerStatus status, LocalDate hireDate,
                  LocalDate resignedAt, String description) {
        this.workerCode = workerCode;
        this.workerName = workerName;
        this.phone = phone;
        this.department = department;
        this.jobTitle = jobTitle;
        this.status = status == null ? WorkerStatus.ACTIVE : status;
        this.hireDate = hireDate;
        this.resignedAt = resignedAt;
        this.description = description;
    }

    /**
     * 작업자 기본 정보를 수정합니다.
     *
     * @param workerName  작업자명
     * @param phone       연락처
     * @param department  소속
     * @param jobTitle    직무
     * @param status      작업자 상태
     * @param hireDate    입사일
     * @param resignedAt  퇴사일
     * @param description 비고
     */
    public void update(String workerName, String phone, String department, String jobTitle,
                       WorkerStatus status, LocalDate hireDate, LocalDate resignedAt,
                       String description) {
        this.workerName = workerName;
        this.phone = phone;
        this.department = department;
        this.jobTitle = jobTitle;
        this.status = status;
        this.hireDate = hireDate;
        this.resignedAt = resignedAt;
        this.description = description;
    }

    /**
     * 작업자를 퇴사 상태로 변경합니다.
     *
     * @param resignedAt 퇴사일
     */
    public void resign(LocalDate resignedAt) {
        this.status = WorkerStatus.RESIGNED;
        this.resignedAt = resignedAt;
    }
}
