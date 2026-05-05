package com.mymes.backend.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardSummaryResponse {

    /** 기간 내 전체 작업지시 수 */
    private final int totalWorkOrders;

    /** 기간 내 완료된 작업지시 수 */
    private final int completedWorkOrders;

    /** 완료율 (%) */
    private final double completionRate;

    /** 불량률 (%) — 기간 내 불량수량 / 완성수량 */
    private final double defectRate;

    /** 설비가동률 (%) — 기간 내 생산실적이 있는 설비 / 전체 활성 설비 */
    private final double equipmentUtilizationRate;
}
