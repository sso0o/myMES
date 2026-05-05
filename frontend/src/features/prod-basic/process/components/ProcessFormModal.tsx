import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import Modal from '@/common/components/Modal'
import AppNumberField from '@/common/components/AppNumberField'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import AppTextField from '@/common/components/AppTextField'
import AppTextarea from '@/common/components/AppTextarea'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import {
  formClass,
  formLabelClass,
} from '@/common/styles/form'
import { useProcessTypeOptions } from '../hooks/useProcessQuery'
import {
  processFormSchema,
  type ProcessFormInput,
  type ProcessFormValues,
} from '../schemas/processSchema'
import type { ProcessCreateRequest, ProcessResponse, ProcessUpdateRequest } from '../types'

interface ProcessFormModalProps {
  open: boolean
  editTarget: ProcessResponse | null
  onClose: () => void
  onSubmit: (data: ProcessCreateRequest | ProcessUpdateRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const getDefaultValues = (editTarget: ProcessResponse | null): ProcessFormInput => ({
  processName: editTarget?.processName ?? '',
  processTypeId: editTarget?.processTypeId ?? '',
  standardTime: editTarget?.standardTime ?? '',
  description: editTarget?.description ?? '',
  isActive: editTarget?.isActive ?? true,
})

const ProcessFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: ProcessFormModalProps) => {
  const { data: processTypeOptions = [] } = useProcessTypeOptions()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProcessFormInput, unknown, ProcessFormValues>({
    resolver: zodResolver(processFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })

  const isActive = useWatch({ control, name: 'isActive' }) ?? true

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editTarget))
    }
  }, [editTarget, open, reset])

  const handleFormSubmit = (values: ProcessFormValues) => {
    onSubmit({
      processName: values.processName,
      processTypeId: values.processTypeId,
      standardTime: values.standardTime || undefined,
      description: values.description,
      isActive: values.isActive,
    })
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? '공정 수정' : '공정 등록'} onClose={onClose}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
          {editTarget && (
            <div>
              <label className={formLabelClass}>
                공정코드
              </label>
              <AppTextField
                value={editTarget.processCode}
                disabled
                sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
              />
            </div>
          )}

          <div>
            <label className={formLabelClass}>
              공정명 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppTextField
              {...register('processName')}
              placeholder="공정명을 입력하세요"
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            {errors.processName && <p className={formErrorClass}>{errors.processName.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              공정유형
            </label>
            <Controller
              name="processTypeId"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={field.value === '' ? '' : String(field.value)}>
                  <AppMenuItem value="">공정유형 선택</AppMenuItem>
                  {processTypeOptions
                    .filter((opt) => opt.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((opt) => (
                      <AppMenuItem key={opt.id} value={String(opt.id)}>
                        {opt.codeName}
                      </AppMenuItem>
                    ))}
                </AppSelect>
              )}
            />
            {errors.processTypeId && (
              <p className={formErrorClass}>{errors.processTypeId.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>
              표준시간(분)
            </label>
            <AppNumberField
              {...register('standardTime')}
              placeholder="0"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            {errors.standardTime && (
              <p className={formErrorClass}>{errors.standardTime.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>설명</label>
            <AppTextarea
              {...register('description')}
              placeholder="공정에 대한 설명을 입력하세요"
              rows={3}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
            {errors.description && <p className={formErrorClass}>{errors.description.message}</p>}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[var(--text-base)]">사용여부</label>
            <button
              type="button"
              onClick={() => setValue('isActive', !isActive, { shouldDirty: true })}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                isActive ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                  isActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-[var(--text-muted)]">{isActive ? '사용' : '미사용'}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={cancelButtonClass}>
              취소
            </button>
            <button type="submit" disabled={isLoading} className={submitButtonClass}>
              {isLoading ? '처리 중...' : editTarget ? '수정' : '등록'}
            </button>
          </div>
        </form>
    </Modal>
  )
}

export default ProcessFormModal
