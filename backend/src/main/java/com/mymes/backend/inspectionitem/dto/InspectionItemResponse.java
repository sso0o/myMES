package com.mymes.backend.inspectionitem.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mymes.backend.inspectionitem.entity.MeasurementType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InspectionItemResponse {
    private Long id;
    private String inspectionItemCode;
    private String inspectionItemName;
    private Long categoryId;
    private String categoryCode;
    private String categoryName;
    private MeasurementType measurementType;
    private String unit;
    private Integer decimalScale;
    private String description;
    private Integer sortOrder;
    @JsonProperty("isActive")
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
