package com.mymes.backend.planning.dto;

import com.mymes.backend.planning.entity.PlanStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ProductionPlanResponse {

    private Long id;
    private String planNo;

    private Long itemId;
    private String itemCode;
    private String itemName;

    private Integer plannedQty;
    private LocalDate plannedDate;
    private LocalDate dueDate;

    private PlanStatus status;

    private Long workOrderId;
    private String workOrderNo;

    private Long createdById;
    private String createdByName;

    private String memo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
