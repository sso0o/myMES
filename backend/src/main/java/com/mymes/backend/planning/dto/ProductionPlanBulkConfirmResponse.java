package com.mymes.backend.planning.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 생산계획 일괄 확정 응답 DTO.
 */
@Getter
@Builder
public class ProductionPlanBulkConfirmResponse {

    /** 요청한 계획 수 */
    private int requestedCount;

    /** 실제 확정된 계획 수 */
    private int confirmedCount;
}
