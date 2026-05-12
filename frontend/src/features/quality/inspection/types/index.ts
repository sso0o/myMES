export const QualityInspectionType = {
  INCOMING: 'INCOMING',
  IN_PROCESS: 'IN_PROCESS',
  FINAL: 'FINAL',
} as const
export type QualityInspectionType =
  (typeof QualityInspectionType)[keyof typeof QualityInspectionType]

export const QualityInspectionStatus = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const
export type QualityInspectionStatus =
  (typeof QualityInspectionStatus)[keyof typeof QualityInspectionStatus]

export const QualityInspectionResult = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  HOLD: 'HOLD',
} as const
export type QualityInspectionResult =
  (typeof QualityInspectionResult)[keyof typeof QualityInspectionResult]

export interface QualityInspectionResponse {
  id: number
  inspectionNo: string
  inspectionDate: string
  inspectionType: QualityInspectionType
  status: QualityInspectionStatus
  result: QualityInspectionResult
  itemId: number
  itemCode: string
  itemName: string
  processId: number | null
  processCode: string | null
  processName: string | null
  workOrderId: number | null
  workOrderNo: string | null
  inspectionStandardId: number | null
  inspectionItemId: number | null
  inspectionItemCode: string | null
  inspectionItemName: string | null
  productionRecordId: number | null
  inspectionQty: number
  passQty: number
  defectQty: number
  inspectorName: string | null
  remarks: string | null
  createdAt: string
  updatedAt: string
}

export interface QualityInspectionCreateRequest {
  inspectionDate: string
  inspectionType: QualityInspectionType
  status?: QualityInspectionStatus
  result?: QualityInspectionResult
  itemId: number
  processId?: number
  workOrderId?: number
  inspectionQty: number
  passQty: number
  defectQty: number
  inspectorName?: string
  remarks?: string
}

export interface QualityInspectionUpdateRequest {
  inspectionDate: string
  inspectionType: QualityInspectionType
  status: QualityInspectionStatus
  result: QualityInspectionResult
  itemId: number
  processId?: number
  workOrderId?: number
  inspectionQty: number
  passQty: number
  defectQty: number
  inspectorName?: string
  remarks?: string
}
