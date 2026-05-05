package com.mymes.backend.dashboard.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.dashboard.dto.*;
import com.mymes.backend.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * 기간별 KPI 요약 정보를 조회합니다.
     *
     * @param period 조회 기간 (TODAY / WEEK, 기본값: TODAY)
     * @return 작업지시 수, 완료율, 불량률, 설비가동률
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @RequestParam(defaultValue = "TODAY") DashboardPeriod period) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getSummary(period)));
    }

    /**
     * 기간별 작업지시 상태 분포를 조회합니다.
     *
     * @param period 조회 기간 (TODAY / WEEK, 기본값: TODAY)
     * @return WAITING / IN_PROGRESS / COMPLETED 상태별 카운트
     */
    @GetMapping("/workorder-status")
    public ResponseEntity<ApiResponse<List<WorkOrderStatusCountResponse>>> getWorkOrderStatus(
            @RequestParam(defaultValue = "TODAY") DashboardPeriod period) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getWorkOrderStatusCounts(period)));
    }

    /**
     * 기간별 생산량 추이를 조회합니다.
     *
     * @param period 조회 기간 (TODAY: 시간별, WEEK: 일별)
     * @return 시간/날짜별 완성수량 목록
     */
    @GetMapping("/production-trend")
    public ResponseEntity<ApiResponse<List<ProductionTrendResponse>>> getProductionTrend(
            @RequestParam(defaultValue = "TODAY") DashboardPeriod period) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getProductionTrend(period)));
    }

    /**
     * 기간별 불량 유형 분포를 조회합니다.
     *
     * @param period 조회 기간 (TODAY / WEEK)
     * @return 불량 유형별 수량 목록
     */
    @GetMapping("/defect-distribution")
    public ResponseEntity<ApiResponse<List<DefectDistributionResponse>>> getDefectDistribution(
            @RequestParam(defaultValue = "TODAY") DashboardPeriod period) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDefectDistribution(period)));
    }

    /**
     * 납기 기준 이슈 작업지시 목록을 조회합니다.
     * 기간 필터 없이 현재 미완료된 납기 초과 작업지시를 최대 10건 반환합니다.
     *
     * @return 이슈 작업지시 목록
     */
    @GetMapping("/issues")
    public ResponseEntity<ApiResponse<List<DashboardIssueResponse>>> getIssues() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getIssues()));
    }
}
