import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  BomBulkCopyRequest,
  BomBulkCopyResponse,
  BomResponse,
  BomSaveRequest,
  BomVersionResponse,
} from '../types'

const BOM_API_PATH = '/prod-basic/boms'

export const bomApi = {
  getList: (parentItemId: number) =>
    api.get<ApiResponse<BomResponse[]>>(BOM_API_PATH, { params: { parentItemId } }),

  getVersionHistory: (parentItemId: number) =>
    api.get<ApiResponse<BomVersionResponse[]>>(`${BOM_API_PATH}/${parentItemId}/versions`),

  getVersionLines: (parentItemId: number, versionId: number) =>
    api.get<ApiResponse<BomResponse[]>>(
      `${BOM_API_PATH}/${parentItemId}/versions/${versionId}/lines`,
    ),

  save: (parentItemId: number, data: BomSaveRequest) =>
    api.post<ApiResponse<BomResponse[]>>(`${BOM_API_PATH}/${parentItemId}/save`, data),

  restore: (parentItemId: number, versionId: number) =>
    api.post<ApiResponse<BomResponse[]>>(
      `${BOM_API_PATH}/${parentItemId}/versions/${versionId}/restore`,
    ),

  bulkCopy: (data: BomBulkCopyRequest) =>
    api.post<ApiResponse<BomBulkCopyResponse>>(`${BOM_API_PATH}/copy`, data),
}
