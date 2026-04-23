package com.mymes.backend.planning.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class ProductionPlanUpdateRequest {

    @NotNull(message = "품목은 필수입니다.")
    private Long itemId;

    @NotNull(message = "계획수량은 필수입니다.")
    @Min(value = 1, message = "계획수량은 1 이상이어야 합니다.")
    private Integer plannedQty;

    @NotNull(message = "생산예정일은 필수입니다.")
    private LocalDate plannedDate;

    @Size(max = 50)
    private String lineName;

    @Size(max = 500)
    private String memo;
}
