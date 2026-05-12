import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import Modal from '@/common/components/Modal'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import AppTextField from '@/common/components/AppTextField'
import AppTextarea from '@/common/components/AppTextarea'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { formClass, formLabelClass } from '@/common/styles/form'
import {
  defectActionSchema,
  type DefectActionFormInput,
  type DefectActionFormValues,
} from '../schemas/defectSchema'
import type { DefectActionUpdateRequest, DefectResponse } from '../types'
import { DefectAction } from '../types'

interface DefectActionModalProps {
  open: boolean
  defect: DefectResponse | null
  onClose: () => void
  onSubmit: (data: DefectActionUpdateRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const actionStatusOptions = [
  { value: DefectAction.WAITING, label: '대기' },
  { value: DefectAction.REWORK, label: '재작업' },
  { value: DefectAction.SCRAP, label: '폐기' },
  { value: DefectAction.COMPLETED, label: '완료' },
]

const getDefaultValues = (defect: DefectResponse | null): DefectActionFormInput => ({
  actionStatus: defect?.actionStatus ?? DefectAction.WAITING,
  actionMemo: defect?.actionMemo ?? '',
  disposition: defect?.disposition ?? '',
  assigneeName: defect?.assigneeName ?? '',
})

const DefectActionModal = ({ open, defect, onClose, onSubmit, isLoading }: DefectActionModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<DefectActionFormInput, unknown, DefectActionFormValues>({
    resolver: zodResolver(defectActionSchema),
    defaultValues: getDefaultValues(defect),
  })

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(defect))
    }
  }, [defect, open, reset])

  const handleFormSubmit = (values: DefectActionFormValues) => {
    onSubmit({
      actionStatus: values.actionStatus,
      actionMemo: values.actionMemo,
      disposition: values.disposition,
      assigneeName: values.assigneeName,
    })
  }

  if (!open || !defect) return null

  return (
    <Modal title="불량 조치 수정" onClose={onClose}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
        <div className="rounded-lg bg-[var(--surface-alt)] px-4 py-3 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[var(--text-base)]">
            <span>
              <span className="text-[var(--text-muted)]">불량유형</span>{' '}
              <strong>{defect.defectType}</strong>
            </span>
            <span>
              <span className="text-[var(--text-muted)]">수량</span>{' '}
              <strong className="text-[var(--danger)]">{defect.qty.toLocaleString()}</strong>
            </span>
            {defect.workOrderNo && (
              <span>
                <span className="text-[var(--text-muted)]">작업지시</span>{' '}
                <span className="font-mono">{defect.workOrderNo}</span>
              </span>
            )}
            {defect.qualityInspectionNo && (
              <span>
                <span className="text-[var(--text-muted)]">품질검사</span>{' '}
                <span className="font-mono">{defect.qualityInspectionNo}</span>
              </span>
            )}
          </div>
        </div>

        <div>
          <label className={formLabelClass}>
            조치상태 <span className="text-[var(--danger)]">*</span>
          </label>
          <Controller
            name="actionStatus"
            control={control}
            render={({ field }) => (
              <AppSelect {...field} value={String(field.value)}>
                {actionStatusOptions.map((option) => (
                  <AppMenuItem key={option.value} value={option.value}>
                    {option.label}
                  </AppMenuItem>
                ))}
              </AppSelect>
            )}
          />
          {errors.actionStatus && (
            <p className={formErrorClass}>{errors.actionStatus.message}</p>
          )}
        </div>

        <div>
          <label className={formLabelClass}>처분방법</label>
          <AppTextField
            {...register('disposition')}
            placeholder="폐기, 재사용 등"
            slotProps={{ htmlInput: { maxLength: 20 } }}
          />
          {errors.disposition && (
            <p className={formErrorClass}>{errors.disposition.message}</p>
          )}
        </div>

        <div>
          <label className={formLabelClass}>담당자</label>
          <AppTextField
            {...register('assigneeName')}
            placeholder="담당자명을 입력하세요"
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
          {errors.assigneeName && (
            <p className={formErrorClass}>{errors.assigneeName.message}</p>
          )}
        </div>

        <div>
          <label className={formLabelClass}>조치내용</label>
          <AppTextarea
            {...register('actionMemo')}
            placeholder="조치 내용을 입력하세요"
            rows={3}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          {errors.actionMemo && (
            <p className={formErrorClass}>{errors.actionMemo.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={cancelButtonClass}>
            취소
          </button>
          <button type="submit" disabled={isLoading} className={submitButtonClass}>
            {isLoading ? '처리 중...' : '저장'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default DefectActionModal
