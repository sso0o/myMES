import { z } from 'zod'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const planningFormSchema = z
  .object({
    itemId: z.coerce
      .number({ error: '품목을 선택해주세요.' })
      .int()
      .positive('품목을 선택해주세요.'),

    plannedQty: z.coerce
      .number({ error: '계획수량을 입력해주세요.' })
      .int('계획수량은 정수여야 합니다.')
      .min(1, '계획수량은 1 이상이어야 합니다.'),

    plannedDate: z
      .string({ error: '생산예정일을 선택해주세요.' })
      .regex(datePattern, '날짜 형식이 올바르지 않습니다.'),

    dueDate: z
      .string()
      .trim()
      .refine((value) => value === '' || datePattern.test(value), '날짜 형식이 올바르지 않습니다.')
      .transform((value) => value || undefined)
      .optional(),

    memo: z
      .string()
      .max(500, '메모는 500자 이하로 입력해주세요.')
      .transform((v) => v.trim() || undefined)
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dueDate && data.dueDate < data.plannedDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['dueDate'],
        message: '납기일은 생산예정일보다 빠를 수 없습니다.',
      })
    }
  })

export type PlanningFormInput = z.input<typeof planningFormSchema>
export type PlanningFormValues = z.output<typeof planningFormSchema>
