package com.mymes.backend.defect.dto;

import com.mymes.backend.defect.entity.DefectAction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class DefectActionUpdateRequest {
    @NotNull(message = "조치상태는 필수입니다.")
    private DefectAction actionStatus;

    @Size(max = 500)
    private String actionMemo;

    @Size(max = 20)
    private String disposition;

    @Size(max = 50)
    private String assigneeName;
}
