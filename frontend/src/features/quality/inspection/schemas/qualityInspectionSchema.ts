import { z } from 'zod'
import {
  QualityInspectionResult,
  QualityInspectionStatus,
  QualityInspectionType,
} from '../types'

const emptyStringToUndefined = (value: unknown) => {
  if (value === '' || value === null) return undefined
  return value
}

export const qualityInspectionFormSchema = z
  .object({
    inspectionDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '검사일자를 선택해주세요.'),
    inspectionType: z.enum([
      QualityInspectionType.INCOMING,
      QualityInspectionType.IN_PROCESS,
      QualityInspectionType.FINAL,
    ], {
      error: '검사유형을 선택해주세요.',
    }),
    status: z.enum([
      QualityInspectionStatus.WAITING,
      QualityInspectionStatus.IN_PROGRESS,
      QualityInspectionStatus.COMPLETED,
    ], {
      error: '검사상태를 선택해주세요.',
    }),
    result: z.enum([
      QualityInspectionResult.PASS,
      QualityInspectionResult.FAIL,
      QualityInspectionResult.HOLD,
    ], {
      error: '판정결과를 선택해주세요.',
    }),
    itemId: z.coerce.number().int().positive('품목을 선택해주세요.'),
    processId: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().int().positive('공정이 올바르지 않습니다.').optional(),
    ),
    workOrderId: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().int().positive('작업지시가 올바르지 않습니다.').optional(),
    ),
    inspectionQty: z.coerce.number().int().min(0, '검사수량은 0 이상이어야 합니다.'),
    passQty: z.coerce.number().int().min(0, '합격수량은 0 이상이어야 합니다.'),
    defectQty: z.coerce.number().int().min(0, '불량수량은 0 이상이어야 합니다.'),
    inspectorName: z
      .string()
      .trim()
      .max(50, '검사자는 50자 이하로 입력해주세요.')
      .transform((value) => value || undefined),
    remarks: z
      .string()
      .trim()
      .max(500, '비고는 500자 이하로 입력해주세요.')
      .transform((value) => value || undefined),
  })
  .refine((value) => value.passQty + value.defectQty <= value.inspectionQty, {
    path: ['defectQty'],
    message: '합격수량과 불량수량의 합은 검사수량을 초과할 수 없습니다.',
  })

export type QualityInspectionFormInput = z.input<typeof qualityInspectionFormSchema>
export type QualityInspectionFormValues = z.output<typeof qualityInspectionFormSchema>
