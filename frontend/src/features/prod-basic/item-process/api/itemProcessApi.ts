import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  ItemProcessBulkCopyRequest,
  ItemProcessBulkCopyResponse,
  ItemProcessCreateRequest,
  ItemProcessResponse,
  ItemProcessUpdateRequest,
} from '../types'

const ITEM_PROCESS_API_PATH = '/prod-basic/item-processes'

export const itemProcessApi = {
  getByItemId: (itemId: number) =>
    api.get<ApiResponse<ItemProcessResponse[]>>(ITEM_PROCESS_API_PATH, { params: { itemId } }),
  getById: (id: number) => api.get<ApiResponse<ItemProcessResponse>>(`${ITEM_PROCESS_API_PATH}/${id}`),
  create: (data: ItemProcessCreateRequest) =>
    api.post<ApiResponse<ItemProcessResponse>>(ITEM_PROCESS_API_PATH, data),
  update: (id: number, data: ItemProcessUpdateRequest) =>
    api.put<ApiResponse<ItemProcessResponse>>(`${ITEM_PROCESS_API_PATH}/${id}`, data),
  delete: (id: number) => api.delete(`${ITEM_PROCESS_API_PATH}/${id}`),
  bulkCopy: (data: ItemProcessBulkCopyRequest) =>
    api.post<ApiResponse<ItemProcessBulkCopyResponse>>(`${ITEM_PROCESS_API_PATH}/copy`, data),
}
