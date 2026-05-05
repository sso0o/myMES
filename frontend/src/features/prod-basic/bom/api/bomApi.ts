import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  BomBulkCopyRequest,
  BomBulkCopyResponse,
  BomResponse,
  BomSaveRequest,
  BomVersionResponse,
} from '../types'

export const bomApi = {
  getList: (parentItemId: number) =>
    api.get<ApiResponse<BomResponse[]>>('/prod-basic/boms', { params: { parentItemId } }),

  getVersionHistory: (parentItemId: number) =>
    api.get<ApiResponse<BomVersionResponse[]>>(`/prod-basic/boms/${parentItemId}/versions`),

  getVersionLines: (parentItemId: number, versionId: number) =>
    api.get<ApiResponse<BomResponse[]>>(
      `/prod-basic/boms/${parentItemId}/versions/${versionId}/lines`,
    ),

  save: (parentItemId: number, data: BomSaveRequest) =>
    api.post<ApiResponse<BomResponse[]>>(`/prod-basic/boms/${parentItemId}/save`, data),

  restore: (parentItemId: number, versionId: number) =>
    api.post<ApiResponse<BomResponse[]>>(
      `/prod-basic/boms/${parentItemId}/versions/${versionId}/restore`,
    ),

  bulkCopy: (data: BomBulkCopyRequest) =>
    api.post<ApiResponse<BomBulkCopyResponse>>('/prod-basic/boms/copy', data),
}
