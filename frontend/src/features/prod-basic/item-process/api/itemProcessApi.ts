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
    api.get<ApiResponse<ItemProcessResponse[]>>('/prod-basic/item-processes', { params: { itemId } }),
  getById: (id: number) => api.get<ApiResponse<ItemProcessResponse>>(`/prod-basic/item-processes/${id}`),
  create: (data: ItemProcessCreateRequest) =>
    api.post<ApiResponse<ItemProcessResponse>>('/prod-basic/item-processes', data),
  update: (id: number, data: ItemProcessUpdateRequest) =>
    api.put<ApiResponse<ItemProcessResponse>>(`/prod-basic/item-processes/${id}`, data),
  delete: (id: number) => api.delete(`/prod-basic/item-processes/${id}`),
  bulkCopy: (data: ItemProcessBulkCopyRequest) =>
    api.post<ApiResponse<ItemProcessBulkCopyResponse>>('/prod-basic/item-processes/copy', data),
}
