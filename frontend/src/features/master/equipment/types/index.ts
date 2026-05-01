export interface EquipmentResponse {
  id: number
  equipmentCode: string
  equipmentName: string
  equipmentTypeId: number | null
  equipmentTypeName: string | null
  location: string | null
  manufacturer: string | null
  modelName: string | null
  purchaseDate: string | null
  description: string | null
  isActive: boolean
  createdAt: string
}

export interface EquipmentCreateRequest {
  equipmentName: string
  equipmentTypeId?: number
  location?: string
  manufacturer?: string
  modelName?: string
  purchaseDate?: string
  description?: string
  isActive: boolean
}

export interface EquipmentUpdateRequest {
  equipmentName: string
  equipmentTypeId?: number
  location?: string
  manufacturer?: string
  modelName?: string
  purchaseDate?: string
  description?: string
  isActive: boolean
}
