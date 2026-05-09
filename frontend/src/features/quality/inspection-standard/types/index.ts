import type { MeasurementType } from '@/features/quality/inspection-item/types'

export interface InspectionStandardResponse {
  id: number
  itemId: number
  itemCode: string
  itemName: string
  processId: number
  processCode: string
  processName: string
  inspectionItemId: number
  inspectionItemCode: string
  inspectionItemName: string
  categoryCode: string
  categoryName: string
  measurementType: MeasurementType
  inspectionMethodId: number
  inspectionMethodCode: string
  inspectionMethodName: string
  standardValue: string | null
  lowerLimit: number | null
  upperLimit: number | null
  unit: string | null
  sampleQty: number | null
  isRequired: boolean
  sortOrder: number
  isActive: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface InspectionStandardCreateRequest {
  itemId: number
  processId: number
  inspectionItemId: number
  inspectionMethodCode: string
  standardValue?: string
  lowerLimit?: number
  upperLimit?: number
  unit?: string
  sampleQty?: number
  isRequired: boolean
  sortOrder?: number
  isActive: boolean
  description?: string
}

export interface InspectionStandardUpdateRequest {
  inspectionMethodCode: string
  standardValue?: string
  lowerLimit?: number
  upperLimit?: number
  unit?: string
  sampleQty?: number
  isRequired: boolean
  sortOrder?: number
  isActive: boolean
  description?: string
}
