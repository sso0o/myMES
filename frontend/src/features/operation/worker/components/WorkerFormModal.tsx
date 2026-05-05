import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import AppTextField from '@/common/components/AppTextField'
import AppTextarea from '@/common/components/AppTextarea'
import Modal from '@/common/components/Modal'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { formClass, formDisabledInputClass, formLabelClass } from '@/common/styles/form'
import {
  workerFormSchema,
  type WorkerFormInput,
  type WorkerFormValues,
} from '../schemas/workerSchema'
import { WorkerStatus } from '../types'
import type { WorkerCreateRequest, WorkerResponse, WorkerUpdateRequest } from '../types'

interface WorkerFormModalProps {
  open: boolean
  editTarget: WorkerResponse | null
  onClose: () => void
  onSubmit: (data: WorkerCreateRequest | WorkerUpdateRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const getDefaultValues = (editTarget: WorkerResponse | null): WorkerFormInput => ({
  workerName: editTarget?.workerName ?? '',
  phone: editTarget?.phone ?? '',
  department: editTarget?.department ?? '',
  jobTitle: editTarget?.jobTitle ?? '',
  status: editTarget?.status ?? WorkerStatus.ACTIVE,
  hireDate: editTarget?.hireDate ?? '',
  resignedAt: editTarget?.resignedAt ?? '',
  description: editTarget?.description ?? '',
})

const WorkerFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: WorkerFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<WorkerFormInput, unknown, WorkerFormValues>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })

  const status = useWatch({ control, name: 'status' }) ?? WorkerStatus.ACTIVE

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editTarget))
    }
  }, [editTarget, open, reset])

  const handleFormSubmit = (values: WorkerFormValues) => {
    const basePayload = {
      workerName: values.workerName,
      phone: values.phone,
      department: values.department,
      jobTitle: values.jobTitle,
      hireDate: values.hireDate,
      description: values.description,
    }

    if (!editTarget) {
      onSubmit(basePayload)
      return
    }

    onSubmit({
      ...basePayload,
      status: values.status,
      resignedAt: values.resignedAt,
    })
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? '작업자 수정' : '작업자 등록'} onClose={onClose}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
        {editTarget && (
          <div>
            <label className={formLabelClass}>작업자코드</label>
            <input value={editTarget.workerCode} disabled className={formDisabledInputClass} />
          </div>
        )}

        <div>
          <label className={formLabelClass}>
            작업자명 <span className="text-[var(--danger)]">*</span>
          </label>
          <AppTextField
            {...register('workerName')}
            placeholder="작업자명을 입력하세요"
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
          {errors.workerName && <p className={formErrorClass}>{errors.workerName.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={formLabelClass}>소속</label>
            <AppTextField
              {...register('department')}
              placeholder="예: 생산1팀"
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            {errors.department && <p className={formErrorClass}>{errors.department.message}</p>}
          </div>
          <div>
            <label className={formLabelClass}>직무</label>
            <AppTextField
              {...register('jobTitle')}
              placeholder="예: 조립"
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            {errors.jobTitle && <p className={formErrorClass}>{errors.jobTitle.message}</p>}
          </div>
        </div>

        <div>
          <label className={formLabelClass}>연락처</label>
          <AppTextField
            {...register('phone')}
            placeholder="010-0000-0000"
            slotProps={{ htmlInput: { maxLength: 30 } }}
          />
          {errors.phone && <p className={formErrorClass}>{errors.phone.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={formLabelClass}>입사일</label>
            <AppTextField type="date" {...register('hireDate')} />
            {errors.hireDate && <p className={formErrorClass}>{errors.hireDate.message}</p>}
          </div>

          {editTarget && (
            <div>
              <label className={formLabelClass}>상태</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <AppSelect {...field} value={field.value}>
                    <AppMenuItem value={WorkerStatus.ACTIVE}>재직</AppMenuItem>
                    <AppMenuItem value={WorkerStatus.ON_LEAVE}>휴직</AppMenuItem>
                    <AppMenuItem value={WorkerStatus.RESIGNED}>퇴사</AppMenuItem>
                  </AppSelect>
                )}
              />
              {errors.status && <p className={formErrorClass}>{errors.status.message}</p>}
            </div>
          )}
        </div>

        {editTarget && status === WorkerStatus.RESIGNED && (
          <div>
            <label className={formLabelClass}>
              퇴사일 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppTextField type="date" {...register('resignedAt')} />
            {errors.resignedAt && <p className={formErrorClass}>{errors.resignedAt.message}</p>}
          </div>
        )}

        <div>
          <label className={formLabelClass}>비고</label>
          <AppTextarea
            {...register('description')}
            placeholder="작업자 메모를 입력하세요"
            rows={3}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          {errors.description && <p className={formErrorClass}>{errors.description.message}</p>}
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

export default WorkerFormModal
