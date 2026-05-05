import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  ProductionRecordCreateRequest,
  ProductionRecordResponse,
  ProductionRecordUpdateRequest,
} from '../types'

export const productionRecordApi = {
  getByWorkOrder: (workOrderId: number) =>
    api.get<ApiResponse<ProductionRecordResponse[]>>(
      `/work-orders/${workOrderId}/production-records`,
    ),

  create: (workOrderId: number, data: ProductionRecordCreateRequest) =>
    api.post<ApiResponse<ProductionRecordResponse>>(
      `/work-orders/${workOrderId}/production-records`,
      data,
    ),

  update: (id: number, data: ProductionRecordUpdateRequest) =>
    api.put<ApiResponse<ProductionRecordResponse>>(`/production-records/${id}`, data),
}
