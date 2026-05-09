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

const PRODUCTION_PLAN_API_PATH = '/prod-management/production-plans'

export const planningApi = {
  getList: (status?: PlanStatus) =>
    api.get<ApiResponse<ProductionPlanResponse[]>>(PRODUCTION_PLAN_API_PATH, {
      params: status ? { status } : undefined,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<ProductionPlanResponse>>(`${PRODUCTION_PLAN_API_PATH}/${id}`),

  create: (data: ProductionPlanCreateRequest) =>
    api.post<ApiResponse<ProductionPlanResponse>>(PRODUCTION_PLAN_API_PATH, data),

  update: (id: number, data: ProductionPlanUpdateRequest) =>
    api.put<ApiResponse<ProductionPlanResponse>>(`${PRODUCTION_PLAN_API_PATH}/${id}`, data),

  changeStatus: (id: number, data: ProductionPlanStatusUpdateRequest) =>
    api.patch<ApiResponse<ProductionPlanResponse>>(`${PRODUCTION_PLAN_API_PATH}/${id}/status`, data),

  delete: (id: number) => api.delete(`${PRODUCTION_PLAN_API_PATH}/${id}`),

  bulkConfirm: (planIds: number[]) =>
    api.post<ApiResponse<ProductionPlanBulkConfirmResponse>>(`${PRODUCTION_PLAN_API_PATH}/bulk-confirm`, { planIds }),

  bulkRelease: (planIds: number[]) =>
    api.post<ApiResponse<ProductionPlanBulkReleaseResponse>>(`${PRODUCTION_PLAN_API_PATH}/bulk-release`, { planIds }),
}
