package com.mymes.backend.processEquipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessEquipmentResponse {

    private Long id;

    private Long processId;
    private String processCode;
    private String processName;

    private Long equipmentId;
    private String equipmentCode;
    private String equipmentName;

    private boolean isPrimary;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
