package com.mymes.backend.inspectionstandard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mymes.backend.inspectionitem.entity.MeasurementType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class InspectionStandardResponse {
    private Long id;
    private Long itemId;
    private String itemCode;
    private String itemName;
    private Long processId;
    private String processCode;
    private String processName;
    private Long inspectionItemId;
    private String inspectionItemCode;
    private String inspectionItemName;
    private String categoryCode;
    private String categoryName;
    private MeasurementType measurementType;
    private Long inspectionMethodId;
    private String inspectionMethodCode;
    private String inspectionMethodName;
    private String standardValue;
    private BigDecimal lowerLimit;
    private BigDecimal upperLimit;
    private String unit;
    private Integer sampleQty;
    @JsonProperty("isRequired")
    private boolean isRequired;
    private Integer sortOrder;
    @JsonProperty("isActive")
    private boolean isActive;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
