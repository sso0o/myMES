export interface ItemProcessResponse {
  id: number
  itemId: number
  itemCode: string
  itemName: string
  processId: number
  processCode: string
  processName: string
  sequence: number
  createdAt: string
}

export interface ItemProcessCreateRequest {
  itemId: number
  processId: number
  sequence: number
}

export interface ItemProcessUpdateRequest {
  processId: number
  sequence: number
}

export const CopyMode = {
  REPLACE: 'REPLACE',
  APPEND: 'APPEND',
} as const
export type CopyMode = (typeof CopyMode)[keyof typeof CopyMode]

export interface ItemProcessBulkCopyRequest {
  sourceItemId: number
  targetItemIds: number[]
  mode: CopyMode
}

export interface ItemProcessBulkCopyResponse {
  sourceItemId: number
  targetCount: number
  copiedCount: number
}
