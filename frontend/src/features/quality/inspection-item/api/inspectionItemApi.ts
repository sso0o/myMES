import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  InspectionItemCreateRequest,
  InspectionItemResponse,
  InspectionItemUpdateRequest,
} from '../types'

const INSPECTION_ITEM_API_PATH = '/quality/inspection-items'

export const inspectionItemApi = {
  getList: () => api.get<ApiResponse<InspectionItemResponse[]>>(INSPECTION_ITEM_API_PATH),

  getById: (id: number) =>
    api.get<ApiResponse<InspectionItemResponse>>(`${INSPECTION_ITEM_API_PATH}/${id}`),

  create: (data: InspectionItemCreateRequest) =>
    api.post<ApiResponse<InspectionItemResponse>>(INSPECTION_ITEM_API_PATH, data),

  update: (id: number, data: InspectionItemUpdateRequest) =>
    api.put<ApiResponse<InspectionItemResponse>>(`${INSPECTION_ITEM_API_PATH}/${id}`, data),

  delete: (id: number) => api.delete(`${INSPECTION_ITEM_API_PATH}/${id}`),
}
