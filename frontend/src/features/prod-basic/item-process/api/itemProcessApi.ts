import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  ItemProcessBulkCopyRequest,
  ItemProcessBulkCopyResponse,
  ItemProcessCreateRequest,
  ItemProcessResponse,
  ItemProcessUpdateRequest,
} from '../types'

export const itemProcessApi = {
  getByItemId: (itemId: number) =>
    api.get<ApiResponse<ItemProcessResponse[]>>('/item-processes', { params: { itemId } }),
  getById: (id: number) => api.get<ApiResponse<ItemProcessResponse>>(`/item-processes/${id}`),
  create: (data: ItemProcessCreateRequest) =>
    api.post<ApiResponse<ItemProcessResponse>>('/item-processes', data),
  update: (id: number, data: ItemProcessUpdateRequest) =>
    api.put<ApiResponse<ItemProcessResponse>>(`/item-processes/${id}`, data),
  delete: (id: number) => api.delete(`/item-processes/${id}`),
  bulkCopy: (data: ItemProcessBulkCopyRequest) =>
    api.post<ApiResponse<ItemProcessBulkCopyResponse>>('/item-processes/copy', data),
}
