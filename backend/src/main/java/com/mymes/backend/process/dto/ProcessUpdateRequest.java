package com.mymes.backend.process.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ProcessUpdateRequest {

    @NotBlank(message = "공정명은 필수입니다.")
    @Size(max = 100)
    private String processName;
}
