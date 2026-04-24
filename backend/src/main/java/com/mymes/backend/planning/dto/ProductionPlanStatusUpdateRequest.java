package com.mymes.backend.planning.dto;

import com.mymes.backend.planning.entity.PlanStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ProductionPlanStatusUpdateRequest {

    @NotNull(message = "상태는 필수입니다.")
    private PlanStatus status;
}
