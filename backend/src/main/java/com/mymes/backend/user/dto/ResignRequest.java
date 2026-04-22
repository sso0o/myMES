package com.mymes.backend.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class ResignRequest {

    @NotNull(message = "퇴사일은 필수입니다.")
    private LocalDate resignedAt;
}
