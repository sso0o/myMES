import { z } from 'zod'
import { DefectAction } from '../types'

export const defectActionSchema = z.object({
  actionStatus: z.enum(
    [DefectAction.WAITING, DefectAction.REWORK, DefectAction.SCRAP, DefectAction.COMPLETED],
    { error: '조치상태를 선택해주세요.' },
  ),
  actionMemo: z
    .string()
    .max(500, '조치내용은 500자 이하로 입력해주세요.')
    .transform((v) => v.trim() || undefined)
    .optional(),
  disposition: z
    .string()
    .max(20, '처분방법은 20자 이하로 입력해주세요.')
    .transform((v) => v.trim() || undefined)
    .optional(),
  assigneeName: z
    .string()
    .max(50, '담당자는 50자 이하로 입력해주세요.')
    .transform((v) => v.trim() || undefined)
    .optional(),
})

export type DefectActionFormInput = z.input<typeof defectActionSchema>
export type DefectActionFormValues = z.output<typeof defectActionSchema>
