package com.mymes.backend.processEquipment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessEquipmentUpdateRequest {

    @NotNull(message = "주 설비 여부는 필수입니다.")
    private Boolean isPrimary;
}
