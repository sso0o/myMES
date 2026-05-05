package com.mymes.backend.planning.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 생산계획 일괄 작업지시 발행 응답 DTO.
 */
@Getter
@Builder
public class ProductionPlanBulkReleaseResponse {

    /** 요청한 계획 수 */
    private int requestedCount;

    /** 실제 발행된 계획 수 */
    private int releasedCount;

    /** 자동 생성된 작업지시 수 */
    private int workOrderCount;
}
