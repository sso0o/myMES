import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { EquipmentCreateRequest, EquipmentResponse, EquipmentUpdateRequest } from '../types'

const EQUIPMENT_API_PATH = '/prod-basic/equipment'

export const equipmentApi = {
  getList: () => api.get<ApiResponse<EquipmentResponse[]>>(EQUIPMENT_API_PATH),
  getById: (id: number) => api.get<ApiResponse<EquipmentResponse>>(`${EQUIPMENT_API_PATH}/${id}`),
  create: (data: EquipmentCreateRequest) =>
    api.post<ApiResponse<EquipmentResponse>>(EQUIPMENT_API_PATH, data),
  update: (id: number, data: EquipmentUpdateRequest) =>
    api.put<ApiResponse<EquipmentResponse>>(`${EQUIPMENT_API_PATH}/${id}`, data),
  delete: (id: number) => api.delete(`${EQUIPMENT_API_PATH}/${id}`),
}
