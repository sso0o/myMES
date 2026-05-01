import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (value === '' || value === null) return undefined
  return value
}

const optionalTrimmedString = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || undefined)

export const equipmentFormSchema = z.object({
  equipmentName: z
    .string()
    .trim()
    .min(1, '설비명을 입력해주세요')
    .max(100, '설비명은 100자 이하로 입력해주세요'),
  equipmentTypeId: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int('설비유형이 올바르지 않습니다').positive('설비유형이 올바르지 않습니다').optional(),
  ),
  location: optionalTrimmedString(200, '위치는 200자 이하로 입력해주세요'),
  manufacturer: optionalTrimmedString(100, '제조사는 100자 이하로 입력해주세요'),
  modelName: optionalTrimmedString(100, '모델명은 100자 이하로 입력해주세요'),
  purchaseDate: z.preprocess(
    emptyStringToUndefined,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '구입일 형식이 올바르지 않습니다').optional(),
  ),
  description: optionalTrimmedString(500, '설명은 500자 이하로 입력해주세요'),
  isActive: z.boolean().default(true),
})

export type EquipmentFormInput = z.input<typeof equipmentFormSchema>
export type EquipmentFormValues = z.output<typeof equipmentFormSchema>
