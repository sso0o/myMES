package com.mymes.backend.inspectionitem.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mymes.backend.inspectionitem.entity.MeasurementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class InspectionItemUpdateRequest {

    @NotBlank(message = "검사항목명은 필수입니다.")
    @Size(max = 100)
    private String inspectionItemName;

    @NotBlank(message = "검사항목분류는 필수입니다.")
    @Size(max = 50)
    private String categoryCode;

    @NotNull(message = "측정방식은 필수입니다.")
    private MeasurementType measurementType;

    @Size(max = 20)
    private String unit;

    @Min(value = 0, message = "소수점 자리수는 0 이상이어야 합니다.")
    private Integer decimalScale;

    @Size(max = 500)
    private String description;

    @Min(value = 0, message = "정렬순서는 0 이상이어야 합니다.")
    private Integer sortOrder;

    @JsonProperty("isActive")
    private boolean isActive;
}
