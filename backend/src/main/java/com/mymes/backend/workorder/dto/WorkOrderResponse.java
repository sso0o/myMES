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
    private Long processId;
    private String processCode;
    private String processName;
    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;
    private String workerName;
    private LocalDate productionDate;
    private LocalDate dueDate;
    private Long bomVersionId;
    private Integer bomVersionNo;
    private Integer sequence;
    private String planNo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
