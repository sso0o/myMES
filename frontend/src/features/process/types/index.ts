export interface ProcessResponse {
  id: number
  processCode: string
  processName: string
  processTypeId: number | null
  processTypeName: string | null
  standardTime: number | null
  description: string | null
  isActive: boolean
  createdAt: string
}

export interface ProcessCreateRequest {
  processName: string
  processTypeId?: number
  standardTime?: number
  description?: string
  isActive: boolean
}

export interface ProcessUpdateRequest {
  processName: string
  processTypeId?: number
  standardTime?: number
  description?: string
  isActive: boolean
}
