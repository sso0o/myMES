package com.mymes.backend.worker.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerResignRequest {

    @NotNull(message = "퇴사일은 필수입니다.")
    private LocalDate resignedAt;
}
