package com.mymes.backend.workorder.dto;

import com.mymes.backend.workorder.entity.Priority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class WorkOrderUpdateRequest {
    @NotNull(message = "품목은 필수입니다.")
    private Long itemId;

    @NotNull(message = "계획수량은 필수입니다.")
    @Min(value = 1, message = "계획수량은 1 이상이어야 합니다.")
    private Integer plannedQty;

    @NotNull(message = "우선순위는 필수입니다.")
    private Priority priority;

    private Long processId;

    @Size(max = 50)
    private String workerName;

    @NotNull(message = "납기일은 필수입니다.")
    private LocalDate dueDate;
}
