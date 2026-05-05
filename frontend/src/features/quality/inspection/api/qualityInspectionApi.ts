import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  QualityInspectionCreateRequest,
  QualityInspectionResponse,
  QualityInspectionStatus,
  QualityInspectionUpdateRequest,
} from '../types'

export const qualityInspectionApi = {
  getList: (status?: QualityInspectionStatus) =>
    api.get<ApiResponse<QualityInspectionResponse[]>>('/quality-inspections', {
      params: status ? { status } : undefined,
    }),

  getById: (id: number) =>
    api.get<ApiResponse<QualityInspectionResponse>>(`/quality-inspections/${id}`),

  create: (data: QualityInspectionCreateRequest) =>
    api.post<ApiResponse<QualityInspectionResponse>>('/quality-inspections', data),

  update: (id: number, data: QualityInspectionUpdateRequest) =>
    api.put<ApiResponse<QualityInspectionResponse>>(`/quality-inspections/${id}`, data),

  delete: (id: number) => api.delete(`/quality-inspections/${id}`),
}
