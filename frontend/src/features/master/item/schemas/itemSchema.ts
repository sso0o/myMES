import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (value === '' || value === null) return undefined
  return value
}

export const itemFormSchema = z.object({
  itemName: z
    .string()
    .trim()
    .min(1, '품목명을 입력해주세요')
    .max(100, '품목명은 100자 이하로 입력해주세요'),
  itemTypeId: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int('품목구분이 올바르지 않습니다').positive('품목구분을 선택해주세요'),
  ),
  unit: z
    .string()
    .trim()
    .min(1, '단위를 선택해주세요')
    .max(20, '단위는 20자 이하로 입력해주세요'),
})

export type ItemFormInput = z.input<typeof itemFormSchema>
export type ItemFormValues = z.output<typeof itemFormSchema>
