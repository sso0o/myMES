package com.mymes.backend.item.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ItemResponse {
    private Long id;
    private String itemCode;
    private String itemName;
    private String unit;
    private Long itemTypeId;
    private String itemTypeCode;
    private String itemTypeName;
    private LocalDateTime createdAt;
}
