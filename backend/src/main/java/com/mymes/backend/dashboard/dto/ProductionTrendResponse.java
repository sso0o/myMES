package com.mymes.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProductionTrendResponse {

    /** 시간 레이블 — TODAY: "00:00"~"23:00", WEEK: "05/01"~"05/07" */
    private final String label;

    /** 해당 시간대 완성수량 합계 */
    private final int completedQty;
}
