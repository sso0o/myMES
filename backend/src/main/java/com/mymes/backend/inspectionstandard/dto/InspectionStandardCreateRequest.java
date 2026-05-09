package com.mymes.backend.inspectionstandard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class InspectionStandardCreateRequest {

    @NotNull(message = "품목은 필수입니다.")
    private Long itemId;

    @NotNull(message = "공정은 필수입니다.")
    private Long processId;

    @NotNull(message = "검사항목은 필수입니다.")
    private Long inspectionItemId;

    @NotBlank(message = "검사방식은 필수입니다.")
    @Size(max = 50)
    private String inspectionMethodCode;

    @Size(max = 100)
    private String standardValue;

    private BigDecimal lowerLimit;

    private BigDecimal upperLimit;

    @Size(max = 20)
    private String unit;

    @Min(value = 1, message = "샘플수는 1 이상이어야 합니다.")
    private Integer sampleQty;

    @JsonProperty("isRequired")
    private boolean isRequired = true;

    @Min(value = 0, message = "정렬순서는 0 이상이어야 합니다.")
    private Integer sortOrder = 0;

    @JsonProperty("isActive")
    private boolean isActive = true;

    @Size(max = 500)
    private String description;
}
