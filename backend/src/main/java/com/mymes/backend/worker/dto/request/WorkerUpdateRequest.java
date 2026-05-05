package com.mymes.backend.worker.dto.request;

import com.mymes.backend.worker.entity.WorkerStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerUpdateRequest {

    @NotBlank(message = "작업자명은 필수입니다.")
    @Size(max = 50)
    private String workerName;

    @Size(max = 30)
    private String phone;

    @Size(max = 100)
    private String department;

    @Size(max = 100)
    private String jobTitle;

    @NotNull(message = "작업자 상태는 필수입니다.")
    private WorkerStatus status;

    private LocalDate hireDate;

    private LocalDate resignedAt;

    @Size(max = 500)
    private String description;
}
