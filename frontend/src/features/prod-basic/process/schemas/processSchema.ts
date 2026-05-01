import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (value === '' || value === null) return undefined
  return value
}

export const processFormSchema = z.object({
  processName: z
    .string()
    .trim()
    .min(1, '공정명을 입력해주세요')
    .max(100, '공정명은 100자 이하로 입력해주세요'),
  processTypeId: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int('공정유형이 올바르지 않습니다').positive('공정유형이 올바르지 않습니다').optional(),
  ),
  standardTime: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().min(0, '표준시간은 0 이상이어야 합니다').optional(),
  ),
  description: z
    .string()
    .trim()
    .max(500, '설명은 500자 이하로 입력해주세요')
    .transform((value) => value || undefined),
  isActive: z.boolean().default(true),
})

export type ProcessFormInput = z.input<typeof processFormSchema>
export type ProcessFormValues = z.output<typeof processFormSchema>
