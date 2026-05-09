import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  InspectionStandardCreateRequest,
  InspectionStandardResponse,
  InspectionStandardUpdateRequest,
} from '../types'

export const inspectionStandardApi = {
  getList: (itemId?: number, processId?: number) =>
    api.get<ApiResponse<InspectionStandardResponse[]>>('/inspection-standards', {
      params: itemId && processId ? { itemId, processId } : undefined,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<InspectionStandardResponse>>(`/inspection-standards/${id}`),

  create: (data: InspectionStandardCreateRequest) =>
    api.post<ApiResponse<InspectionStandardResponse>>('/inspection-standards', data),

  update: (id: number, data: InspectionStandardUpdateRequest) =>
    api.put<ApiResponse<InspectionStandardResponse>>(`/inspection-standards/${id}`, data),

  delete: (id: number) => api.delete(`/inspection-standards/${id}`),
}
