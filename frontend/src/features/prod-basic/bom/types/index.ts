export interface BomResponse {
  id: number
  parentItemId: number
  parentItemCode: string
  parentItemName: string
  materialItemId: number
  materialItemCode: string
  materialItemName: string
  materialItemTypeName: string | null
  unit: string
  sequence: number
  quantity: number
  description: string | null
  createdAt: string
}

export interface BomCreateRequest {
  parentItemId: number
  materialItemId: number
  sequence: number
  quantity: number
  description?: string
}

export interface BomUpdateRequest {
  materialItemId: number
  sequence: number
  quantity: number
  description?: string
}
