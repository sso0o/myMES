package com.mymes.backend.production.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProductionResponse {
    private Long id;
    private Long workOrderId;
    private String workOrderNo;
    private Long processId;
    private String processName;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer inputQty;
    private Integer completedQty;
    private Integer defectQty;
    private LocalDateTime createdAt;
}
