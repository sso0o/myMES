package com.mymes.backend.itemprocess.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

/**
 * 품목별 공정 일괄 복사 요청 DTO.
 */
@Getter
public class ItemProcessBulkCopyRequest {

    @NotNull(message = "원본 품목은 필수입니다.")
    private Long sourceItemId;

    @NotEmpty(message = "대상 품목은 1개 이상이어야 합니다.")
    private List<Long> targetItemIds;

    @NotNull(message = "복사 방식은 필수입니다.")
    private CopyMode mode;
}
