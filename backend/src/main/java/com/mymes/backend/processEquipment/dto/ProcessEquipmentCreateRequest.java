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
public class ProcessEquipmentCreateRequest {

    @NotNull(message = "공정 ID는 필수입니다.")
    private Long processId;

    @NotNull(message = "설비 ID는 필수입니다.")
    private Long equipmentId;

    private boolean isPrimary = false;
}
