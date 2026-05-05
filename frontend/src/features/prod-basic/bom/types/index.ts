export const BomVersionStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const
export type BomVersionStatus = (typeof BomVersionStatus)[keyof typeof BomVersionStatus]

export interface BomVersionResponse {
  id: number
  versionNo: number
  status: BomVersionStatus
  createdAt: string
}

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
  versionId: number
  versionNo: number
  versionStatus: BomVersionStatus
  createdAt: string
}

export interface BomLineRequest {
  materialItemId: number
  sequence: number
  quantity: number
  description?: string
}

export interface BomSaveRequest {
  lines: BomLineRequest[]
}

export const BomCopyMode = {
  REPLACE: 'REPLACE',
  APPEND: 'APPEND',
} as const
export type BomCopyMode = (typeof BomCopyMode)[keyof typeof BomCopyMode]

export interface BomBulkCopyRequest {
  sourceItemId: number
  targetItemIds: number[]
  mode: BomCopyMode
}

export interface BomBulkCopyResponse {
  sourceItemId: number
  targetCount: number
  copiedCount: number
}
