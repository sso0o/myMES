package com.mymes.backend.workorder.dto;

import com.mymes.backend.workorder.entity.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class WorkOrderStatusUpdateRequest {
    @NotNull(message = "상태는 필수입니다.")
    private WorkOrderStatus status;
}
