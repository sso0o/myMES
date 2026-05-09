import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  ProductionRecordCreateRequest,
  ProductionRecordResponse,
  ProductionRecordUpdateRequest,
} from '../types'

const WORK_ORDER_API_PATH = '/prod-management/work-orders'
const PRODUCTION_RECORD_API_PATH = '/prod-management/production-records'

export const productionRecordApi = {
  getByWorkOrder: (workOrderId: number) =>
    api.get<ApiResponse<ProductionRecordResponse[]>>(
      `${WORK_ORDER_API_PATH}/${workOrderId}/production-records`,
    ),

  create: (workOrderId: number, data: ProductionRecordCreateRequest) =>
    api.post<ApiResponse<ProductionRecordResponse>>(
      `${WORK_ORDER_API_PATH}/${workOrderId}/production-records`,
      data,
    ),

  update: (id: number, data: ProductionRecordUpdateRequest) =>
    api.put<ApiResponse<ProductionRecordResponse>>(`${PRODUCTION_RECORD_API_PATH}/${id}`, data),
}
