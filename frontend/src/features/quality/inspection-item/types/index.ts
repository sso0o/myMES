export const MeasurementType = {
  NUMERIC: 'NUMERIC',
  PASS_FAIL: 'PASS_FAIL',
  TEXT: 'TEXT',
} as const
export type MeasurementType = (typeof MeasurementType)[keyof typeof MeasurementType]

export const MEASUREMENT_TYPE_LABEL: Record<MeasurementType, string> = {
  [MeasurementType.NUMERIC]: '수치입력',
  [MeasurementType.PASS_FAIL]: '합격/불합격',
  [MeasurementType.TEXT]: '텍스트',
}

export interface InspectionItemResponse {
  id: number
  inspectionItemCode: string
  inspectionItemName: string
  categoryId: number
  categoryCode: string
  categoryName: string
  measurementType: MeasurementType
  unit: string | null
  decimalScale: number | null
  description: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface InspectionItemCreateRequest {
  inspectionItemName: string
  categoryCode: string
  measurementType: MeasurementType
  unit?: string
  decimalScale?: number
  description?: string
  sortOrder?: number
  isActive: boolean
}

export interface InspectionItemUpdateRequest {
  inspectionItemName: string
  categoryCode: string
  measurementType: MeasurementType
  unit?: string
  decimalScale?: number
  description?: string
  sortOrder?: number
  isActive: boolean
}
