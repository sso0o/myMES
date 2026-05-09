import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  QualityInspectionCreateRequest,
  QualityInspectionResponse,
  QualityInspectionStatus,
  QualityInspectionUpdateRequest,
} from '../types'

const QUALITY_INSPECTION_API_PATH = '/quality/quality-inspections'

export const qualityInspectionApi = {
  getList: (status?: QualityInspectionStatus) =>
    api.get<ApiResponse<QualityInspectionResponse[]>>(QUALITY_INSPECTION_API_PATH, {
      params: status ? { status } : undefined,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<QualityInspectionResponse>>(`${QUALITY_INSPECTION_API_PATH}/${id}`),

  create: (data: QualityInspectionCreateRequest) =>
    api.post<ApiResponse<QualityInspectionResponse>>(QUALITY_INSPECTION_API_PATH, data),

  update: (id: number, data: QualityInspectionUpdateRequest) =>
    api.put<ApiResponse<QualityInspectionResponse>>(`${QUALITY_INSPECTION_API_PATH}/${id}`, data),

  delete: (id: number) => api.delete(`${QUALITY_INSPECTION_API_PATH}/${id}`),
}
