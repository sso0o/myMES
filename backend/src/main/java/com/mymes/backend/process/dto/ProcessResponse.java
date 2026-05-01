package com.mymes.backend.process.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProcessResponse {
    private Long id;
    private String processCode;
    private String processName;
    private Long processTypeId;
    private String processTypeName;
    private Integer standardTime;
    private String description;
    @JsonProperty("isActive")
    private boolean isActive;
    private LocalDateTime createdAt;
}
