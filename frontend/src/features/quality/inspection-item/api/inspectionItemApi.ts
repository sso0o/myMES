import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  InspectionItemCreateRequest,
  InspectionItemResponse,
  InspectionItemUpdateRequest,
} from '../types'

export const inspectionItemApi = {
  getList: () => api.get<ApiResponse<InspectionItemResponse[]>>('/inspection-items'),

  getById: (id: number) =>
    api.get<ApiResponse<InspectionItemResponse>>(`/inspection-items/${id}`),

  create: (data: InspectionItemCreateRequest) =>
    api.post<ApiResponse<InspectionItemResponse>>('/inspection-items', data),

  update: (id: number, data: InspectionItemUpdateRequest) =>
    api.put<ApiResponse<InspectionItemResponse>>(`/inspection-items/${id}`, data),

  delete: (id: number) => api.delete(`/inspection-items/${id}`),
}
