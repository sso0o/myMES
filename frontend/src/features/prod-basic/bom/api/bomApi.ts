import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { BomCreateRequest, BomResponse, BomUpdateRequest } from '../types'

export const bomApi = {
  getList: (parentItemId: number) =>
    api.get<ApiResponse<BomResponse[]>>('/boms', { params: { parentItemId } }),
  getById: (id: number) => api.get<ApiResponse<BomResponse>>(`/boms/${id}`),
  create: (data: BomCreateRequest) => api.post<ApiResponse<BomResponse>>('/boms', data),
  update: (id: number, data: BomUpdateRequest) =>
    api.put<ApiResponse<BomResponse>>(`/boms/${id}`, data),
  delete: (id: number) => api.delete(`/boms/${id}`),
}
