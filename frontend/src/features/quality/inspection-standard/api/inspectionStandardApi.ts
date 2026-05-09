import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  InspectionStandardCreateRequest,
  InspectionStandardResponse,
  InspectionStandardUpdateRequest,
} from '../types'

const INSPECTION_STANDARD_API_PATH = '/quality/inspection-standards'

export const inspectionStandardApi = {
  getList: (itemId?: number, processId?: number) =>
    api.get<ApiResponse<InspectionStandardResponse[]>>(INSPECTION_STANDARD_API_PATH, {
      params: itemId && processId ? { itemId, processId } : undefined,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<InspectionStandardResponse>>(`${INSPECTION_STANDARD_API_PATH}/${id}`),

  create: (data: InspectionStandardCreateRequest) =>
    api.post<ApiResponse<InspectionStandardResponse>>(INSPECTION_STANDARD_API_PATH, data),

  update: (id: number, data: InspectionStandardUpdateRequest) =>
    api.put<ApiResponse<InspectionStandardResponse>>(`${INSPECTION_STANDARD_API_PATH}/${id}`, data),

  delete: (id: number) => api.delete(`${INSPECTION_STANDARD_API_PATH}/${id}`),
}
