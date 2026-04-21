package com.mymes.backend.defect.dto;

import com.mymes.backend.defect.entity.DefectAction;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class DefectActionUpdateRequest {
    @NotNull(message = "조치상태는 필수입니다.")
    private DefectAction actionStatus;
}
