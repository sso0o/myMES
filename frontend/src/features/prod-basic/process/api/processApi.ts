import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { ProcessCreateRequest, ProcessResponse, ProcessUpdateRequest } from '../types'

export const processApi = {
  getList: () => api.get<ApiResponse<ProcessResponse[]>>('/prod-basic/processes'),
  getById: (id: number) => api.get<ApiResponse<ProcessResponse>>(`/prod-basic/processes/${id}`),
  create: (data: ProcessCreateRequest) =>
    api.post<ApiResponse<ProcessResponse>>('/prod-basic/processes', data),
  update: (id: number, data: ProcessUpdateRequest) =>
    api.put<ApiResponse<ProcessResponse>>(`/prod-basic/processes/${id}`, data),
  delete: (id: number) => api.delete(`/prod-basic/processes/${id}`),
}
