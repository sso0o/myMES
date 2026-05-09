import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { WorkOrderResponse, WorkOrderStatus, WorkOrderUpdateRequest } from '../types'

const WORK_ORDER_API_PATH = '/prod-management/work-orders'

export const workOrderApi = {
  getList: (status?: WorkOrderStatus) =>
    api.get<ApiResponse<WorkOrderResponse[]>>(WORK_ORDER_API_PATH, {
      params: status ? { status } : undefined,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<WorkOrderResponse>>(`${WORK_ORDER_API_PATH}/${id}`),

  update: (id: number, data: WorkOrderUpdateRequest) =>
    api.put<ApiResponse<WorkOrderResponse>>(`${WORK_ORDER_API_PATH}/${id}`, data),

  changeStatus: (id: number, status: WorkOrderStatus) =>
    api.patch<ApiResponse<WorkOrderResponse>>(`${WORK_ORDER_API_PATH}/${id}/status`, { status }),
}
