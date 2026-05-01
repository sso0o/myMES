package com.mymes.backend.itemprocess.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 품목별 공정 일괄 복사 응답 DTO.
 */
@Getter
@Builder
public class ItemProcessBulkCopyResponse {

    private Long sourceItemId;

    /** 요청된 대상 품목 수 */
    private int targetCount;

    /** 실제 복사 성공한 품목 수 */
    private int copiedCount;
}
