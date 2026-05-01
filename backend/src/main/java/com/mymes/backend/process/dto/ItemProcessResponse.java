package com.mymes.backend.process.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ItemProcessResponse {
    private Long id;
    private Long itemId;
    private String itemCode;
    private String itemName;
    private Long processId;
    private String processCode;
    private String processName;
    private Integer sequence;
    private LocalDateTime createdAt;
}
