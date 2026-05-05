export interface ProcessEquipmentResponse {
  id: number
  processId: number
  processCode: string
  processName: string
  equipmentId: number
  equipmentCode: string
  equipmentName: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface ProcessEquipmentCreateRequest {
  processId: number
  equipmentId: number
  isPrimary: boolean
}

export interface ProcessEquipmentUpdateRequest {
  isPrimary: boolean
}

export interface ProcessEquipmentInlineRow {
  equipmentId: string
  isPrimary: boolean
}
