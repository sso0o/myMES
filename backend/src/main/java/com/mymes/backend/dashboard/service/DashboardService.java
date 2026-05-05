package com.mymes.backend.dashboard.service;

import com.mymes.backend.dashboard.dto.*;
import com.mymes.backend.dashboard.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    private static final DateTimeFormatter HOUR_FORMATTER = DateTimeFormatter.ofPattern("HH:00");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd");

    /**
     * 기간별 KPI 요약 정보를 조회합니다.
     *
     * @param period 조회 기간 (TODAY / WEEK)
     * @return KPI 요약 응답
     */
    public DashboardSummaryResponse getSummary(DashboardPeriod period) {
        LocalDate[] dateRange = resolveDateRange(period);
        LocalDateTime[] datetimeRange = resolveDatetimeRange(period);

        long total = dashboardRepository.countTotalWorkOrders(dateRange[0], dateRange[1]);
        long completed = dashboardRepository.countCompletedWorkOrders(dateRange[0], dateRange[1]);

        Object[] productionQty = dashboardRepository.sumProductionQty(datetimeRange[0], datetimeRange[1]);
        long totalCompletedQty = ((Number) productionQty[0]).longValue();
        long totalDefectQty = ((Number) productionQty[1]).longValue();

        double completionRate = total == 0 ? 0.0 : Math.round(completed * 1000.0 / total) / 10.0;
        double defectRate = totalCompletedQty == 0 ? 0.0 : Math.round(totalDefectQty * 1000.0 / totalCompletedQty) / 10.0;
        double equipmentRate = Math.round(dashboardRepository.calcEquipmentUtilizationRate(datetimeRange[0], datetimeRange[1]) * 10.0) / 10.0;

        log.info("대시보드 요약 조회: period={}, total={}, completed={}", period, total, completed);

        return DashboardSummaryResponse.builder()
                .totalWorkOrders((int) total)
                .completedWorkOrders((int) completed)
                .completionRate(completionRate)
                .defectRate(defectRate)
                .equipmentUtilizationRate(equipmentRate)
                .build();
    }

    /**
     * 기간별 작업지시 상태 분포를 조회합니다.
     * 데이터가 없는 상태도 0으로 포함합니다.
     *
     * @param period 조회 기간 (TODAY / WEEK)
     * @return 상태별 카운트 목록
     */
    public List<WorkOrderStatusCountResponse> getWorkOrderStatusCounts(DashboardPeriod period) {
        LocalDate[] range = resolveDateRange(period);
        List<Object[]> rows = dashboardRepository.countWorkOrderByStatus(range[0], range[1]);

        Map<String, Long> countMap = new LinkedHashMap<>();
        countMap.put("WAITING", 0L);
        countMap.put("IN_PROGRESS", 0L);
        countMap.put("COMPLETED", 0L);

        for (Object[] row : rows) {
            countMap.put((String) row[0], ((Number) row[1]).longValue());
        }

        return countMap.entrySet().stream()
                .map(e -> new WorkOrderStatusCountResponse(e.getKey(), e.getValue()))
                .toList();
    }

    /**
     * 기간별 생산량 추이를 조회합니다.
     * TODAY: 0~23시 시간대별, WEEK: 월~일 일별로 데이터를 반환하며 값이 없는 구간은 0으로 채웁니다.
     *
     * @param period 조회 기간 (TODAY / WEEK)
     * @return 생산량 추이 목록
     */
    public List<ProductionTrendResponse> getProductionTrend(DashboardPeriod period) {
        LocalDateTime[] range = resolveDatetimeRange(period);

        if (period == DashboardPeriod.TODAY) {
            return buildHourlyTrend(range[0], range[1]);
        } else {
            return buildDailyTrend(range[0], range[1]);
        }
    }

    /**
     * 기간별 불량 유형 분포를 조회합니다.
     *
     * @param period 조회 기간 (TODAY / WEEK)
     * @return 불량 유형별 수량 목록
     */
    public List<DefectDistributionResponse> getDefectDistribution(DashboardPeriod period) {
        LocalDateTime[] range = resolveDatetimeRange(period);
        List<Object[]> rows = dashboardRepository.defectDistribution(range[0], range[1]);

        return rows.stream()
                .map(row -> new DefectDistributionResponse(
                        (String) row[0],
                        ((Number) row[1]).intValue()
                ))
                .toList();
    }

    /**
     * 납기 기준 이슈 작업지시 목록을 조회합니다.
     * 납기가 오늘 이하인 미완료 작업지시를 최대 10건 반환합니다.
     *
     * @return 이슈 작업지시 목록
     */
    public List<DashboardIssueResponse> getIssues() {
        LocalDate today = LocalDate.now();
        List<Object[]> rows = dashboardRepository.findIssueWorkOrders(today);

        return rows.stream()
                .map(row -> new DashboardIssueResponse(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((java.sql.Date) row[4]).toLocalDate(),
                        ((Number) row[5]).intValue()
                ))
                .toList();
    }

    // --- private helpers ---

    /** TODAY: [오늘, 오늘], WEEK: [이번주 월요일, 이번주 일요일] */
    private LocalDate[] resolveDateRange(DashboardPeriod period) {
        LocalDate today = LocalDate.now();
        if (period == DashboardPeriod.TODAY) {
            return new LocalDate[]{today, today};
        }
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);
        return new LocalDate[]{monday, sunday};
    }

    /** TODAY: [오늘 00:00, 내일 00:00), WEEK: [이번주 월요일 00:00, 다음주 월요일 00:00) */
    private LocalDateTime[] resolveDatetimeRange(DashboardPeriod period) {
        LocalDate today = LocalDate.now();
        if (period == DashboardPeriod.TODAY) {
            return new LocalDateTime[]{today.atStartOfDay(), today.plusDays(1).atStartOfDay()};
        }
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        return new LocalDateTime[]{monday.atStartOfDay(), monday.plusWeeks(1).atStartOfDay()};
    }

    /** 0~23시 전 구간을 채운 시간별 생산량 추이를 반환합니다. */
    private List<ProductionTrendResponse> buildHourlyTrend(LocalDateTime start, LocalDateTime end) {
        List<Object[]> rows = dashboardRepository.productionTrendByHour(start, end);
        Map<Integer, Integer> hourMap = new HashMap<>();
        for (Object[] row : rows) {
            hourMap.put(((Number) row[0]).intValue(), ((Number) row[1]).intValue());
        }

        List<ProductionTrendResponse> result = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            String label = LocalTime.of(h, 0).format(HOUR_FORMATTER);
            result.add(new ProductionTrendResponse(label, hourMap.getOrDefault(h, 0)));
        }
        return result;
    }

    /** 이번 주 월~일 전 구간을 채운 일별 생산량 추이를 반환합니다. */
    private List<ProductionTrendResponse> buildDailyTrend(LocalDateTime start, LocalDateTime end) {
        List<Object[]> rows = dashboardRepository.productionTrendByDay(start, end);
        Map<LocalDate, Integer> dayMap = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            dayMap.put(date, ((Number) row[1]).intValue());
        }

        List<ProductionTrendResponse> result = new ArrayList<>();
        LocalDate cursor = start.toLocalDate();
        LocalDate endDate = end.toLocalDate();
        while (cursor.isBefore(endDate)) {
            result.add(new ProductionTrendResponse(cursor.format(DATE_FORMATTER), dayMap.getOrDefault(cursor, 0)));
            cursor = cursor.plusDays(1);
        }
        return result;
    }
}
