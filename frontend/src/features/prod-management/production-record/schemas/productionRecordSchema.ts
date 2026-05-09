import { z } from 'zod'

const optionalString = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional()

const optionalQty = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : value),
  z.coerce
    .number()
    .int('불량수량은 정수여야 합니다.')
    .min(0, '불량수량은 0 이상이어야 합니다.')
    .optional(),
)

export const productionRecordFormSchema = z
  .object({
    startedAt: optionalString,

    endedAt: optionalString,

    inputQty: z.coerce
      .number({ error: '투입수량을 입력해주세요.' })
      .int('투입수량은 정수여야 합니다.')
      .min(0, '투입수량은 0 이상이어야 합니다.'),

    completedQty: z.coerce
      .number({ error: '양품수량을 입력해주세요.' })
      .int('양품수량은 정수여야 합니다.')
      .min(0, '양품수량은 0 이상이어야 합니다.'),

    defectQty: optionalQty,
  })
  .superRefine((data, ctx) => {
    if (data.startedAt && data.endedAt && data.endedAt < data.startedAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['endedAt'],
        message: '종료일시는 시작일시보다 빠를 수 없습니다.',
      })
    }

    const defectQty = data.defectQty ?? 0
    if (data.completedQty + defectQty > data.inputQty) {
      ctx.addIssue({
        code: 'custom',
        path: ['completedQty'],
        message: '양품수량과 불량수량의 합은 투입수량보다 클 수 없습니다.',
      })
      ctx.addIssue({
        code: 'custom',
        path: ['defectQty'],
        message: '양품수량과 불량수량의 합은 투입수량보다 클 수 없습니다.',
      })
    }
  })

export type ProductionRecordFormInput = z.input<typeof productionRecordFormSchema>
export type ProductionRecordFormValues = z.output<typeof productionRecordFormSchema>
