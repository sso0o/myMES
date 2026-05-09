import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { ProcessCreateRequest, ProcessResponse, ProcessUpdateRequest } from '../types'

const PROCESS_API_PATH = '/prod-basic/processes'

export const processApi = {
  getList: () => api.get<ApiResponse<ProcessResponse[]>>(PROCESS_API_PATH),
  getById: (id: number) => api.get<ApiResponse<ProcessResponse>>(`${PROCESS_API_PATH}/${id}`),
  create: (data: ProcessCreateRequest) =>
    api.post<ApiResponse<ProcessResponse>>(PROCESS_API_PATH, data),
  update: (id: number, data: ProcessUpdateRequest) =>
    api.put<ApiResponse<ProcessResponse>>(`${PROCESS_API_PATH}/${id}`, data),
  delete: (id: number) => api.delete(`${PROCESS_API_PATH}/${id}`),
}
