export const DefectAction = {
  WAITING: 'WAITING',
  REWORK: 'REWORK',
  SCRAP: 'SCRAP',
  COMPLETED: 'COMPLETED',
} as const
export type DefectAction = (typeof DefectAction)[keyof typeof DefectAction]

export interface DefectResponse {
  id: number
  workOrderId: number | null
  workOrderNo: string | null
  productionRecordId: number | null
  qualityInspectionId: number | null
  qualityInspectionNo: string | null
  itemId: number | null
  itemCode: string | null
  itemName: string | null
  processId: number | null
  processCode: string | null
  processName: string | null
  defectType: string
  qty: number
  defectDescription: string | null
  causeCategory: string | null
  actionStatus: DefectAction
  causeMemo: string | null
  actionMemo: string | null
  disposition: string | null
  assigneeName: string | null
  createdAt: string
}

export interface DefectActionUpdateRequest {
  actionStatus: DefectAction
  actionMemo?: string
  disposition?: string
  assigneeName?: string
}
