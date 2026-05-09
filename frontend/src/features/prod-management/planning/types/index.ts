export const PlanStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  RELEASED: 'RELEASED',
  CLOSED: 'CLOSED',
} as const
export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus]

export interface ProductionPlanResponse {
  id: number
  planNo: string
  itemId: number
  itemCode: string
  itemName: string
  plannedQty: number
  plannedDate: string
  dueDate: string | null
  status: PlanStatus
  workOrderId: number | null
  workOrderNo: string | null
  createdById: number
  createdByName: string
  memo: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductionPlanCreateRequest {
  itemId: number
  plannedQty: number
  plannedDate: string
  dueDate?: string
  memo?: string
}

export interface ProductionPlanUpdateRequest {
  itemId: number
  plannedQty: number
  plannedDate: string
  dueDate?: string
  memo?: string
}

export interface ProductionPlanStatusUpdateRequest {
  status: PlanStatus
}

export interface ProductionPlanBulkConfirmResponse {
  requestedCount: number
  confirmedCount: number
}

export interface ProductionPlanBulkReleaseResponse {
  requestedCount: number
  releasedCount: number
  workOrderCount: number
}
