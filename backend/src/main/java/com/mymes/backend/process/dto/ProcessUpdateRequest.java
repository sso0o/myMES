package com.mymes.backend.process.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ProcessUpdateRequest {

    @NotBlank(message = "공정명은 필수입니다.")
    @Size(max = 100)
    private String processName;

    @NotNull(message = "순서는 필수입니다.")
    @Min(value = 1, message = "순서는 1 이상이어야 합니다.")
    private Integer sequence;
}
