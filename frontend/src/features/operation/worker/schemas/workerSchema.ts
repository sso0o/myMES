import { z } from 'zod'
import { WorkerStatus } from '../types'

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

const optionalDate = z.preprocess(
  emptyStringToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다').optional(),
)

export const workerFormSchema = z
  .object({
    workerName: z
      .string()
      .trim()
      .min(1, '작업자명을 입력해주세요')
      .max(50, '작업자명은 50자 이하로 입력해주세요'),
    phone: optionalTrimmedString(30, '연락처는 30자 이하로 입력해주세요'),
    department: optionalTrimmedString(100, '소속은 100자 이하로 입력해주세요'),
    jobTitle: optionalTrimmedString(100, '직무는 100자 이하로 입력해주세요'),
    status: z.enum([WorkerStatus.ACTIVE, WorkerStatus.ON_LEAVE, WorkerStatus.RESIGNED]),
    hireDate: optionalDate,
    resignedAt: optionalDate,
    description: optionalTrimmedString(500, '비고는 500자 이하로 입력해주세요'),
  })
  .superRefine((values, ctx) => {
    if (values.status === WorkerStatus.RESIGNED && !values.resignedAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['resignedAt'],
        message: '퇴사 상태는 퇴사일을 입력해주세요',
      })
    }
  })

export const workerResignSchema = z.object({
  resignedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '퇴사일을 선택해주세요'),
})

export type WorkerFormInput = z.input<typeof workerFormSchema>
export type WorkerFormValues = z.output<typeof workerFormSchema>
export type WorkerResignInput = z.input<typeof workerResignSchema>
export type WorkerResignValues = z.output<typeof workerResignSchema>
