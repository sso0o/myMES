package com.mymes.backend.bom.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

/**
 * BOM 일괄 복사 요청 DTO.
 */
@Getter
public class BomBulkCopyRequest {

    @NotNull(message = "원본 품목은 필수입니다.")
    private Long sourceItemId;

    @NotEmpty(message = "대상 품목은 1개 이상이어야 합니다.")
    private List<Long> targetItemIds;

    @NotNull(message = "복사 방식은 필수입니다.")
    private BomCopyMode mode;
}
