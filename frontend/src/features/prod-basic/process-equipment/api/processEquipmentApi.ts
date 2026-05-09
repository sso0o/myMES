import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  ProcessEquipmentCreateRequest,
  ProcessEquipmentResponse,
  ProcessEquipmentUpdateRequest,
} from '../types'

const PROCESS_EQUIPMENT_API_PATH = '/prod-basic/process-equipment'

export const processEquipmentApi = {
  getByProcessId: (processId: number) =>
    api.get<ApiResponse<ProcessEquipmentResponse[]>>(PROCESS_EQUIPMENT_API_PATH, {
      params: { processId },
    }),
  getByEquipmentId: (equipmentId: number) =>
    api.get<ApiResponse<ProcessEquipmentResponse[]>>(PROCESS_EQUIPMENT_API_PATH, {
      params: { equipmentId },
    }),
  getById: (id: number) =>
    api.get<ApiResponse<ProcessEquipmentResponse>>(`${PROCESS_EQUIPMENT_API_PATH}/${id}`),
  create: (data: ProcessEquipmentCreateRequest) =>
    api.post<ApiResponse<ProcessEquipmentResponse>>(PROCESS_EQUIPMENT_API_PATH, data),
  update: (id: number, data: ProcessEquipmentUpdateRequest) =>
    api.patch<ApiResponse<ProcessEquipmentResponse>>(`${PROCESS_EQUIPMENT_API_PATH}/${id}`, data),
  delete: (id: number) => api.delete(`${PROCESS_EQUIPMENT_API_PATH}/${id}`),
}
