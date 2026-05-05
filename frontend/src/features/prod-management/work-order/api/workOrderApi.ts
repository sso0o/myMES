import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { WorkOrderResponse, WorkOrderStatus, WorkOrderUpdateRequest } from '../types'

export const workOrderApi = {
  getList: (status?: WorkOrderStatus) =>
    api.get<ApiResponse<WorkOrderResponse[]>>('/work-orders', {
      params: status ? { status } : undefined,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<WorkOrderResponse>>(`/work-orders/${id}`),

  update: (id: number, data: WorkOrderUpdateRequest) =>
    api.put<ApiResponse<WorkOrderResponse>>(`/work-orders/${id}`, data),
}
