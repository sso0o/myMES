package com.mymes.backend.dashboard.repository;

import com.mymes.backend.dashboard.dto.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class DashboardRepository {

    private final EntityManager em;

    /**
     * 기간 내 작업지시 총 수를 조회합니다.
     *
     * @param start 기간 시작 (due_date 기준)
     * @param end   기간 종료 (due_date 기준, inclusive)
     * @return 작업지시 총 수
     */
    public long countTotalWorkOrders(LocalDate start, LocalDate end) {
        return ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM work_orders WHERE due_date >= :start AND due_date <= :end AND deleted_at IS NULL"
        ).setParameter("start", start).setParameter("end", end).getSingleResult()).longValue();
    }

    /**
     * 기간 내 완료된 작업지시 수를 조회합니다.
     *
     * @param start 기간 시작
     * @param end   기간 종료
     * @return 완료 작업지시 수
     */
    public long countCompletedWorkOrders(LocalDate start, LocalDate end) {
        return ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM work_orders WHERE status = 'COMPLETED' AND due_date >= :start AND due_date <= :end AND deleted_at IS NULL"
        ).setParameter("start", start).setParameter("end", end).getSingleResult()).longValue();
    }

    /**
     * 기간 내 생산실적의 완성수량 합계와 불량수량 합계를 조회합니다.
     *
     * @param start 기간 시작 (created_at 기준)
     * @param end   기간 종료 (created_at 기준, exclusive)
     * @return [totalCompletedQty, totalDefectQty] 배열
     */
    public Object[] sumProductionQty(LocalDateTime start, LocalDateTime end) {
        Object result = em.createNativeQuery(
                "SELECT COALESCE(SUM(completed_qty), 0), COALESCE(SUM(defect_qty), 0) " +
                        "FROM production_records WHERE created_at >= :start AND created_at < :end AND deleted_at IS NULL"
        ).setParameter("start", start).setParameter("end", end).getSingleResult();
        return (Object[]) result;
    }

    /**
     * 설비가동률을 조회합니다.
     * 기간 내 생산실적이 있는 설비 수 / 전체 활성 설비 수 × 100
     *
     * @param start 기간 시작 (created_at 기준)
     * @param end   기간 종료 (created_at 기준, exclusive)
     * @return 설비가동률 (%)
     */
    public double calcEquipmentUtilizationRate(LocalDateTime start, LocalDateTime end) {
        Object result = em.createNativeQuery(
                "SELECT COALESCE(" +
                        "  (SELECT COUNT(DISTINCT wo.equipment_id) " +
                        "   FROM production_records pr " +
                        "   JOIN work_orders wo ON pr.work_order_id = wo.id " +
                        "   WHERE pr.created_at >= :start AND pr.created_at < :end " +
                        "   AND pr.deleted_at IS NULL AND wo.deleted_at IS NULL AND wo.equipment_id IS NOT NULL) * 100.0 / " +
                        "  NULLIF((SELECT COUNT(*) FROM equipment WHERE is_active = true AND deleted_at IS NULL), 0), 0)"
        ).setParameter("start", start).setParameter("end", end).getSingleResult();
        return result == null ? 0.0 : ((Number) result).doubleValue();
    }

    /**
     * 기간 내 작업지시 상태별 수를 조회합니다.
     *
     * @param start 기간 시작
     * @param end   기간 종료
     * @return 상태별 카운트 목록 (status, count)
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> countWorkOrderByStatus(LocalDate start, LocalDate end) {
        return em.createNativeQuery(
                "SELECT status, COUNT(*) FROM work_orders " +
                        "WHERE due_date >= :start AND due_date <= :end AND deleted_at IS NULL " +
                        "GROUP BY status"
        ).setParameter("start", start).setParameter("end", end).getResultList();
    }

    /**
     * 오늘 기준 시간별 생산량 추이를 조회합니다.
     *
     * @param start 오늘 00:00:00
     * @param end   내일 00:00:00
     * @return 시간(0~23)별 완성수량 목록 (hour, completedQty)
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> productionTrendByHour(LocalDateTime start, LocalDateTime end) {
        return em.createNativeQuery(
                "SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COALESCE(SUM(completed_qty), 0)::int AS qty " +
                        "FROM production_records " +
                        "WHERE created_at >= :start AND created_at < :end AND deleted_at IS NULL " +
                        "GROUP BY EXTRACT(HOUR FROM created_at) " +
                        "ORDER BY hour"
        ).setParameter("start", start).setParameter("end", end).getResultList();
    }

    /**
     * 이번 주 기준 일별 생산량 추이를 조회합니다.
     *
     * @param start 이번주 월요일 00:00:00
     * @param end   다음주 월요일 00:00:00
     * @return 날짜별 완성수량 목록 (date, completedQty)
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> productionTrendByDay(LocalDateTime start, LocalDateTime end) {
        return em.createNativeQuery(
                "SELECT DATE(created_at) AS day, COALESCE(SUM(completed_qty), 0)::int AS qty " +
                        "FROM production_records " +
                        "WHERE created_at >= :start AND created_at < :end AND deleted_at IS NULL " +
                        "GROUP BY DATE(created_at) " +
                        "ORDER BY day"
        ).setParameter("start", start).setParameter("end", end).getResultList();
    }

    /**
     * 기간 내 불량 유형별 수량 분포를 조회합니다.
     *
     * @param start 기간 시작 (created_at 기준)
     * @param end   기간 종료 (created_at 기준, exclusive)
     * @return 불량유형별 수량 목록 (defectType, qty)
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> defectDistribution(LocalDateTime start, LocalDateTime end) {
        return em.createNativeQuery(
                "SELECT defect_type, COALESCE(SUM(qty), 0)::int AS total_qty " +
                        "FROM defect_records " +
                        "WHERE created_at >= :start AND created_at < :end AND deleted_at IS NULL " +
                        "GROUP BY defect_type " +
                        "ORDER BY total_qty DESC"
        ).setParameter("start", start).setParameter("end", end).getResultList();
    }

    /**
     * 납기가 오늘 이하인 미완료 작업지시 목록을 조회합니다.
     *
     * @param today 오늘 날짜
     * @return 이슈 작업지시 목록 (workOrderId, workOrderNo, itemName, status, dueDate, daysOverdue)
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> findIssueWorkOrders(LocalDate today) {
        return em.createNativeQuery(
                "SELECT wo.id, wo.work_order_no, i.item_name, wo.status, wo.due_date, " +
                        "  GREATEST((:today - wo.due_date), 0) AS days_overdue " +
                        "FROM work_orders wo " +
                        "JOIN items i ON wo.item_id = i.id " +
                        "WHERE wo.status IN ('WAITING', 'IN_PROGRESS') " +
                        "AND wo.due_date <= :today " +
                        "AND wo.deleted_at IS NULL " +
                        "ORDER BY wo.due_date ASC " +
                        "LIMIT 10"
        ).setParameter("today", today).getResultList();
    }
}
