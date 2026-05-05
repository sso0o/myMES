package com.mymes.backend.planning.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.util.List;

/**
 * 생산계획 일괄 처리 요청 DTO.
 * 일괄 확정, 일괄 발행 공용으로 사용합니다.
 */
@Getter
public class ProductionPlanBulkRequest {

    @NotEmpty(message = "처리할 생산계획은 1개 이상이어야 합니다.")
    private List<Long> planIds;
}
