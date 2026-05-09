export const WorkOrderStatus = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const
export type WorkOrderStatus = (typeof WorkOrderStatus)[keyof typeof WorkOrderStatus]

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const
export type Priority = (typeof Priority)[keyof typeof Priority]

export interface WorkOrderResponse {
  id: number
  workOrderNo: string
  itemId: number
  itemCode: string
  itemName: string
  plannedQty: number
  priority: Priority
  status: WorkOrderStatus
  processId: number | null
  processCode: string | null
  processName: string | null
  equipmentId: number | null
  equipmentCode: string | null
  equipmentName: string | null
  workerName: string | null
  productionDate: string
  dueDate: string | null
  bomVersionId: number | null
  bomVersionNo: number | null
  createdAt: string
  updatedAt: string
}

export interface WorkOrderUpdateRequest {
  itemId: number
  plannedQty: number
  priority: Priority
  processId?: number
  equipmentId?: number
  workerName?: string
  productionDate: string
  dueDate?: string | null
}
