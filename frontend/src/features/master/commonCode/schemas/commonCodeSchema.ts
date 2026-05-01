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

export const codeGroupFormSchema = z.object({
  groupId: z
    .string()
    .trim()
    .min(1, '그룹 ID를 입력해주세요')
    .max(50, '그룹 ID는 50자 이하로 입력해주세요')
    .transform((value) => value.toUpperCase()),
  groupName: z
    .string()
    .trim()
    .min(1, '그룹명을 입력해주세요')
    .max(100, '그룹명은 100자 이하로 입력해주세요'),
  description: optionalTrimmedString(255, '설명은 255자 이하로 입력해주세요'),
})

export const commonCodeFormSchema = z.object({
  codeName: z
    .string()
    .trim()
    .min(1, '코드명을 입력해주세요')
    .max(100, '코드명은 100자 이하로 입력해주세요'),
  sortOrder: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int('정렬 순서는 정수로 입력해주세요').positive('정렬 순서는 1 이상이어야 합니다'),
  ),
  numberingPrefix: optionalTrimmedString(20, '번호 접두사는 20자 이하로 입력해주세요').transform(
    (value) => value?.toUpperCase(),
  ),
})

export type CodeGroupFormInput = z.input<typeof codeGroupFormSchema>
export type CodeGroupFormValues = z.output<typeof codeGroupFormSchema>
export type CommonCodeFormInput = z.input<typeof commonCodeFormSchema>
export type CommonCodeFormValues = z.output<typeof commonCodeFormSchema>
