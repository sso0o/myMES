import { z } from 'zod'
import { MeasurementType } from '@/features/quality/inspection-item/types'

const emptyStringToUndefined = (value: unknown) => {
  if (value === '' || value === null) return undefined
  return value
}

export const inspectionStandardFormSchema = z
  .object({
    inspectionItemId: z.coerce
      .number({ error: '검사항목을 선택해주세요.' })
      .int()
      .positive('검사항목을 선택해주세요.'),
    measurementType: z.enum(MeasurementType),
    inspectionMethodCode: z
      .string()
      .trim()
      .min(1, '검사방식을 선택해주세요.'),
    standardValue: z
      .string()
      .trim()
      .max(100, '기준값은 100자 이하로 입력해주세요.')
      .transform((value) => value || undefined),
    lowerLimit: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().optional(),
    ),
    upperLimit: z.preprocess(
      emptyStringToUndefined,
      z.coerce.number().optional(),
    ),
    unit: z
      .string()
      .trim()
      .max(20, '단위는 20자 이하로 선택해주세요.')
      .transform((value) => value || undefined),
    sampleQty: z.preprocess(
      emptyStringToUndefined,
      z.coerce
        .number()
        .int('샘플수는 정수여야 합니다.')
        .min(1, '샘플수는 1 이상이어야 합니다.')
        .optional(),
    ),
    isRequired: z.boolean().default(true),
    sortOrder: z.preprocess(
      emptyStringToUndefined,
      z.coerce
        .number()
        .int('정렬순서는 정수여야 합니다.')
        .min(0, '정렬순서는 0 이상이어야 합니다.')
        .optional(),
    ),
    isActive: z.boolean().default(true),
    description: z
      .string()
      .trim()
      .max(500, '설명은 500자 이하로 입력해주세요.')
      .transform((value) => value || undefined),
  })
  .superRefine((data, ctx) => {
    if (data.inspectionMethodCode === 'SAMPLING' && data.sampleQty === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['sampleQty'],
        message: '샘플링 검사방식은 샘플수가 필요합니다.',
      })
    }

    if (data.measurementType !== MeasurementType.NUMERIC) {
      if (data.lowerLimit !== undefined || data.upperLimit !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['lowerLimit'],
          message: '수치입력 항목에서만 하한/상한을 입력할 수 있습니다.',
        })
      }
      return
    }

    if (
      data.lowerLimit !== undefined &&
      data.upperLimit !== undefined &&
      data.lowerLimit > data.upperLimit
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['lowerLimit'],
        message: '하한값은 상한값보다 클 수 없습니다.',
      })
      ctx.addIssue({
        code: 'custom',
        path: ['upperLimit'],
        message: '상한값은 하한값보다 작을 수 없습니다.',
      })
    }
  })

export type InspectionStandardFormInput = z.input<typeof inspectionStandardFormSchema>
export type InspectionStandardFormValues = z.output<typeof inspectionStandardFormSchema>
