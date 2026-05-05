import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type {
  DashboardPeriod,
  DashboardSummaryResponse,
  WorkOrderStatusCountResponse,
  ProductionTrendResponse,
  DefectDistributionResponse,
  DashboardIssueResponse,
} from '../types';

export const dashboardApi = {
  getSummary: (period: DashboardPeriod) =>
    api.get<ApiResponse<DashboardSummaryResponse>>('/dashboard/summary', { params: { period } }),

  getWorkOrderStatus: (period: DashboardPeriod) =>
    api.get<ApiResponse<WorkOrderStatusCountResponse[]>>('/dashboard/workorder-status', { params: { period } }),

  getProductionTrend: (period: DashboardPeriod) =>
    api.get<ApiResponse<ProductionTrendResponse[]>>('/dashboard/production-trend', { params: { period } }),

  getDefectDistribution: (period: DashboardPeriod) =>
    api.get<ApiResponse<DefectDistributionResponse[]>>('/dashboard/defect-distribution', { params: { period } }),

  getIssues: () =>
    api.get<ApiResponse<DashboardIssueResponse[]>>('/dashboard/issues'),
};
