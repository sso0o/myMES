package com.mymes.backend.equipment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class EquipmentResponse {
    private Long id;
    private String equipmentCode;
    private String equipmentName;
    private Long equipmentTypeId;
    private String equipmentTypeName;
    private String location;
    private String manufacturer;
    private String modelName;
    private LocalDate purchaseDate;
    private String description;
    @JsonProperty("isActive")
    private boolean isActive;
    private LocalDateTime createdAt;
}
