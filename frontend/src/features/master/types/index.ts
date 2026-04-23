// 공통코드
export interface CommonCodeResponse {
  id: number
  groupId: string
  code: string
  codeName: string
  sortOrder: number
  isActive: boolean
  numberingPrefix: string | null
  createdAt: string
}

export interface CodeGroupResponse {
  id: number
  groupId: string
  groupName: string
  description: string | null
  isActive: boolean
  codes: CommonCodeResponse[]
  createdAt: string
}

export interface CodeGroupCreateRequest {
  groupId: string
  groupName: string
  description?: string
}

export interface CodeGroupUpdateRequest {
  groupName: string
  description?: string
}

export interface CommonCodeCreateRequest {
  code?: string
  codeName: string
  sortOrder: number
  numberingPrefix?: string
}

export interface CommonCodeUpdateRequest {
  codeName: string
  sortOrder: number
  numberingPrefix?: string
}

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
