import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  ProductionPlanResponse,
  ProductionPlanCreateRequest,
  ProductionPlanUpdateRequest,
  ProductionPlanStatusUpdateRequest,
  ProductionPlanBulkConfirmResponse,
  ProductionPlanBulkReleaseResponse,
  PlanStatus,
} from '../types'

export const planningApi = {
  getList: (status?: PlanStatus) =>
    api.get<ApiResponse<ProductionPlanResponse[]>>('/production-plans', {
      params: status ? { status } : undefined,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<ProductionPlanResponse>>(`/production-plans/${id}`),

  create: (data: ProductionPlanCreateRequest) =>
    api.post<ApiResponse<ProductionPlanResponse>>('/production-plans', data),

  update: (id: number, data: ProductionPlanUpdateRequest) =>
    api.put<ApiResponse<ProductionPlanResponse>>(`/production-plans/${id}`, data),

  changeStatus: (id: number, data: ProductionPlanStatusUpdateRequest) =>
    api.patch<ApiResponse<ProductionPlanResponse>>(`/production-plans/${id}/status`, data),

  delete: (id: number) => api.delete(`/production-plans/${id}`),

  bulkConfirm: (planIds: number[]) =>
    api.post<ApiResponse<ProductionPlanBulkConfirmResponse>>('/production-plans/bulk-confirm', { planIds }),

  bulkRelease: (planIds: number[]) =>
    api.post<ApiResponse<ProductionPlanBulkReleaseResponse>>('/production-plans/bulk-release', { planIds }),
}
