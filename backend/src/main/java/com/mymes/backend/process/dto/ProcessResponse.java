package com.mymes.backend.process.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProcessResponse {
    private Long id;
    private String processCode;
    private String processName;
    private Integer sequence;
    private LocalDateTime createdAt;
}
