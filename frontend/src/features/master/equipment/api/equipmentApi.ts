import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { EquipmentCreateRequest, EquipmentResponse, EquipmentUpdateRequest } from '../types'

export const equipmentApi = {
  getList: () => api.get<ApiResponse<EquipmentResponse[]>>('/equipment'),
  getById: (id: number) => api.get<ApiResponse<EquipmentResponse>>(`/equipment/${id}`),
  create: (data: EquipmentCreateRequest) =>
    api.post<ApiResponse<EquipmentResponse>>('/equipment', data),
  update: (id: number, data: EquipmentUpdateRequest) =>
    api.put<ApiResponse<EquipmentResponse>>(`/equipment/${id}`, data),
  delete: (id: number) => api.delete(`/equipment/${id}`),
}
