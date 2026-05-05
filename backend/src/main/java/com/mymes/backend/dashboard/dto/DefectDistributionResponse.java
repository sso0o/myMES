package com.mymes.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DefectDistributionResponse {

    /** 불량 유형 */
    private final String defectType;

    /** 해당 불량 유형의 총 수량 */
    private final int qty;
}
