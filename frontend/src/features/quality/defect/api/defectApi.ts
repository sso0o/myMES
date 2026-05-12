import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { DefectActionUpdateRequest, DefectResponse } from '../types'

const DEFECT_API_PATH = '/quality/defect-records'

export const defectApi = {
  getAll: () => api.get<ApiResponse<DefectResponse[]>>(DEFECT_API_PATH),

  getById: (id: number) =>
    api.get<ApiResponse<DefectResponse>>(`${DEFECT_API_PATH}/${id}`),

  updateAction: (id: number, data: DefectActionUpdateRequest) =>
    api.patch<ApiResponse<DefectResponse>>(`${DEFECT_API_PATH}/${id}/action`, data),
}
