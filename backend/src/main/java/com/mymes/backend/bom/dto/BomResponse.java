package com.mymes.backend.bom.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class BomResponse {
    private Long id;
    private Long parentItemId;
    private String parentItemCode;
    private String parentItemName;
    private Long materialItemId;
    private String materialItemCode;
    private String materialItemName;
    private String materialItemTypeName;
    private String unit;
    private Integer sequence;
    private BigDecimal quantity;
    private String description;
    private LocalDateTime createdAt;
}
