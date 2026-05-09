import { z } from 'zod'
import { MeasurementType } from '../types'

const emptyStringToUndefined = (value: unknown) => {
  if (value === '' || value === null) return undefined
  return value
}

export const inspectionItemFormSchema = z.object({
  inspectionItemName: z
    .string()
    .trim()
    .min(1, '검사항목명을 입력해주세요.')
    .max(100, '검사항목명은 100자 이하로 입력해주세요.'),
  categoryCode: z
    .string()
    .trim()
    .min(1, '검사항목분류를 선택해주세요.'),
  measurementType: z.enum(MeasurementType, { error: '측정방식을 선택해주세요.' }),
  unit: z
    .string()
    .trim()
    .max(20, '단위는 20자 이하로 선택해주세요.')
    .transform((value) => value || undefined),
  decimalScale: z.preprocess(
    emptyStringToUndefined,
    z.coerce
      .number()
      .int('소수점 자리수는 정수여야 합니다.')
      .min(0, '소수점 자리수는 0 이상이어야 합니다.')
      .optional(),
  ),
  description: z
    .string()
    .trim()
    .max(500, '설명은 500자 이하로 입력해주세요.')
    .transform((value) => value || undefined),
  sortOrder: z.preprocess(
    emptyStringToUndefined,
    z.coerce
      .number()
      .int('정렬순서는 정수여야 합니다.')
      .min(0, '정렬순서는 0 이상이어야 합니다.')
      .optional(),
  ),
  isActive: z.boolean().default(true),
})

export type InspectionItemFormInput = z.input<typeof inspectionItemFormSchema>
export type InspectionItemFormValues = z.output<typeof inspectionItemFormSchema>
