package com.mymes.backend.workorder.dto;

import com.mymes.backend.workorder.entity.Priority;
import com.mymes.backend.workorder.entity.WorkOrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class WorkOrderResponse {
    private Long id;
    private String workOrderNo;
    private Long itemId;
    private String itemCode;
    private String itemName;
    private Integer plannedQty;
    private Priority priority;
    private WorkOrderStatus status;
    private String lineName;
    private String workerName;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
