import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardPeriod } from '../types';

const QUERY_KEYS = {
  summary: (period: DashboardPeriod) => ['dashboard', 'summary', period] as const,
  workOrderStatus: (period: DashboardPeriod) => ['dashboard', 'workOrderStatus', period] as const,
  productionTrend: (period: DashboardPeriod) => ['dashboard', 'productionTrend', period] as const,
  defectDistribution: (period: DashboardPeriod) => ['dashboard', 'defectDistribution', period] as const,
  issues: () => ['dashboard', 'issues'] as const,
};

export function useDashboardSummary(period: DashboardPeriod) {
  return useQuery({
    queryKey: QUERY_KEYS.summary(period),
    queryFn: () => dashboardApi.getSummary(period).then((r) => r.data.data),
  });
}

export function useWorkOrderStatus(period: DashboardPeriod) {
  return useQuery({
    queryKey: QUERY_KEYS.workOrderStatus(period),
    queryFn: () => dashboardApi.getWorkOrderStatus(period).then((r) => r.data.data ?? []),
  });
}

export function useProductionTrend(period: DashboardPeriod) {
  return useQuery({
    queryKey: QUERY_KEYS.productionTrend(period),
    queryFn: () => dashboardApi.getProductionTrend(period).then((r) => r.data.data ?? []),
  });
}

export function useDefectDistribution(period: DashboardPeriod) {
  return useQuery({
    queryKey: QUERY_KEYS.defectDistribution(period),
    queryFn: () => dashboardApi.getDefectDistribution(period).then((r) => r.data.data ?? []),
  });
}

export function useDashboardIssues() {
  return useQuery({
    queryKey: QUERY_KEYS.issues(),
    queryFn: () => dashboardApi.getIssues().then((r) => r.data.data ?? []),
  });
}

/** 작업지시, 생산실적, 불량 테이블 변경 시 대시보드 전체 캐시를 무효화합니다. */
export function useDashboardRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'production_records' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'defect_records' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
