package com.mymes.backend.worker.dto.response;

import com.mymes.backend.worker.entity.WorkerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerResponse {
    private Long id;
    private String workerCode;
    private String workerName;
    private String phone;
    private String department;
    private String jobTitle;
    private WorkerStatus status;
    private LocalDate hireDate;
    private LocalDate resignedAt;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
