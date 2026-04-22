package com.mymes.backend.defect.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class DefectCreateRequest {
    private Long productionRecordId;

    @NotBlank(message = "불량유형은 필수입니다.")
    @Size(max = 50)
    private String defectType;

    @NotNull(message = "수량은 필수입니다.")
    @Min(value = 1, message = "수량은 1 이상이어야 합니다.")
    private Integer qty;

    @Size(max = 500)
    private String causeMemo;
}
