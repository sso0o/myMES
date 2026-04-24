package com.mymes.backend.process.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ProcessUpdateRequest {

    @NotBlank(message = "공정명은 필수입니다.")
    @Size(max = 100)
    private String processName;

    private Long processTypeId;

    @Min(value = 0, message = "표준시간은 0 이상이어야 합니다.")
    private Integer standardTime;

    @Size(max = 500)
    private String description;

    @JsonProperty("isActive")
    private boolean isActive;
}
