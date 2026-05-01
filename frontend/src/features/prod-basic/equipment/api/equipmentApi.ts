import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { EquipmentCreateRequest, EquipmentResponse, EquipmentUpdateRequest } from '../types'

export const equipmentApi = {
  getList: () => api.get<ApiResponse<EquipmentResponse[]>>('/prod-basic/equipment'),
  getById: (id: number) => api.get<ApiResponse<EquipmentResponse>>(`/prod-basic/equipment/${id}`),
  create: (data: EquipmentCreateRequest) =>
    api.post<ApiResponse<EquipmentResponse>>('/prod-basic/equipment', data),
  update: (id: number, data: EquipmentUpdateRequest) =>
    api.put<ApiResponse<EquipmentResponse>>(`/prod-basic/equipment/${id}`, data),
  delete: (id: number) => api.delete(`/prod-basic/equipment/${id}`),
}
