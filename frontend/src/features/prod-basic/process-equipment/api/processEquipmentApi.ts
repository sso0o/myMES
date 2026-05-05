import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  ProcessEquipmentCreateRequest,
  ProcessEquipmentResponse,
  ProcessEquipmentUpdateRequest,
} from '../types'

export const processEquipmentApi = {
  getByProcessId: (processId: number) =>
    api.get<ApiResponse<ProcessEquipmentResponse[]>>('/prod-basic/process-equipment', {
      params: { processId },
    }),
  getByEquipmentId: (equipmentId: number) =>
    api.get<ApiResponse<ProcessEquipmentResponse[]>>('/prod-basic/process-equipment', {
      params: { equipmentId },
    }),
  getById: (id: number) =>
    api.get<ApiResponse<ProcessEquipmentResponse>>(`/prod-basic/process-equipment/${id}`),
  create: (data: ProcessEquipmentCreateRequest) =>
    api.post<ApiResponse<ProcessEquipmentResponse>>('/prod-basic/process-equipment', data),
  update: (id: number, data: ProcessEquipmentUpdateRequest) =>
    api.patch<ApiResponse<ProcessEquipmentResponse>>(`/prod-basic/process-equipment/${id}`, data),
  delete: (id: number) => api.delete(`/prod-basic/process-equipment/${id}`),
}
