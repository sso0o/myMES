export interface ProductionRecordResponse {
  id: number
  workOrderId: number
  workOrderNo: string
  processId: number
  processName: string
  startedAt: string | null
  endedAt: string | null
  inputQty: number
  completedQty: number
  defectQty: number
  createdAt: string
}

export interface ProductionRecordCreateRequest {
  startedAt?: string
  endedAt?: string
  inputQty: number
  completedQty: number
  defectQty?: number
}

export interface ProductionRecordUpdateRequest {
  startedAt?: string
  endedAt?: string
  inputQty: number
  completedQty: number
  defectQty?: number
}
