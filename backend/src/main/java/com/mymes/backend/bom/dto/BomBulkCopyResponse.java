package com.mymes.backend.bom.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * BOM 일괄 복사 응답 DTO.
 */
@Getter
@Builder
public class BomBulkCopyResponse {

    private Long sourceItemId;

    /** 요청된 대상 품목 수 */
    private int targetCount;

    /** 실제 복사 성공한 품목 수 */
    private int copiedCount;
}
