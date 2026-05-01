// 품목
export interface ItemResponse {
  id: number
  itemCode: string
  itemName: string
  unit: string
  itemTypeId: number | null
  itemTypeCode: string | null
  itemTypeName: string | null
  createdAt: string
}

export interface ItemCreateRequest {
  itemName: string
  unit: string
  itemTypeId: number
}

export interface ItemUpdateRequest {
  itemName: string
  unit: string
  itemTypeId: number
}
