import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { ItemResponse, ItemCreateRequest, ItemUpdateRequest } from '../types'

export const itemApi = {
  getList: (page: number, size: number) =>
    api.get<ApiResponse<ItemResponse[]>>('/items', { params: { page, size } }),
  getById: (id: number) => api.get<ApiResponse<ItemResponse>>(`/items/${id}`),
  create: (data: ItemCreateRequest) => api.post<ApiResponse<ItemResponse>>('/items', data),
  update: (id: number, data: ItemUpdateRequest) =>
    api.put<ApiResponse<ItemResponse>>(`/items/${id}`, data),
  delete: (id: number) => api.delete(`/items/${id}`),
}
