import { z } from 'zod'

export const productionRecordFormSchema = z.object({
  startedAt: z.string().optional(),

  endedAt: z.string().optional(),

  inputQty: z.coerce
    .number({ error: '투입수량을 입력해주세요.' })
    .int('투입수량은 정수여야 합니다.')
    .min(0, '투입수량은 0 이상이어야 합니다.'),

  completedQty: z.coerce
    .number({ error: '완료수량을 입력해주세요.' })
    .int('완료수량은 정수여야 합니다.')
    .min(0, '완료수량은 0 이상이어야 합니다.'),

  defectQty: z.coerce
    .number()
    .int('불량수량은 정수여야 합니다.')
    .min(0, '불량수량은 0 이상이어야 합니다.')
    .optional(),
})

export type ProductionRecordFormInput = z.input<typeof productionRecordFormSchema>
export type ProductionRecordFormValues = z.output<typeof productionRecordFormSchema>
