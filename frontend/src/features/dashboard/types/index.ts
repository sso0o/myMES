export type DashboardPeriod = 'TODAY' | 'WEEK';

export interface DashboardSummaryResponse {
  totalWorkOrders: number;
  completedWorkOrders: number;
  completionRate: number;
  defectRate: number;
  equipmentUtilizationRate: number;
}

export interface WorkOrderStatusCountResponse {
  status: string;
  count: number;
}

export interface ProductionTrendResponse {
  label: string;
  completedQty: number;
}

export interface DefectDistributionResponse {
  defectType: string;
  qty: number;
}

export interface DashboardIssueResponse {
  workOrderId: number;
  workOrderNo: string;
  itemName: string;
  status: string;
  dueDate: string;
  daysOverdue: number;
}
