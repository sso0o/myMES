package com.mymes.backend.production.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ProductionCreateRequest {
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    @NotNull(message = "투입수량은 필수입니다.")
    @Min(value = 0, message = "투입수량은 0 이상이어야 합니다.")
    private Integer inputQty;

    @NotNull(message = "완료수량은 필수입니다.")
    @Min(value = 0, message = "완료수량은 0 이상이어야 합니다.")
    private Integer completedQty;

    @Min(value = 0, message = "불량수량은 0 이상이어야 합니다.")
    private Integer defectQty;
}
