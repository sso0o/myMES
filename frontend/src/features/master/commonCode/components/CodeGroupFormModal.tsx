import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Modal from '@/common/components/Modal'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import {
  formClass,
  formInputClass,
  formLabelClass,
  formMonoInputClass,
} from '@/common/styles/form'
import {
  codeGroupFormSchema,
  type CodeGroupFormInput,
  type CodeGroupFormValues,
} from '../schemas/commonCodeSchema'
import type { CodeGroupCreateRequest, CodeGroupResponse, CodeGroupUpdateRequest } from '../types'

interface CodeGroupFormModalProps {
  open: boolean
  editTarget: CodeGroupResponse | null
  onClose: () => void
  onSubmit: (data: CodeGroupCreateRequest | CodeGroupUpdateRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const getDefaultValues = (editTarget: CodeGroupResponse | null): CodeGroupFormInput => ({
  groupId: editTarget?.groupId ?? '',
  groupName: editTarget?.groupName ?? '',
  description: editTarget?.description ?? '',
})

const CodeGroupFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: CodeGroupFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CodeGroupFormInput, unknown, CodeGroupFormValues>({
    resolver: zodResolver(codeGroupFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })
  const groupIdField = register('groupId')

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editTarget))
    }
  }, [editTarget, open, reset])

  const handleFormSubmit = (values: CodeGroupFormValues) => {
    if (editTarget) {
      onSubmit({ groupName: values.groupName, description: values.description })
    } else {
      onSubmit({
        groupId: values.groupId,
        groupName: values.groupName,
        description: values.description,
      })
    }
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? '코드 그룹 수정' : '코드 그룹 등록'} onClose={onClose}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
          <div>
            <label className={formLabelClass}>
              그룹 ID <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              {...groupIdField}
              onChange={(event) => {
                event.target.value = event.target.value.toUpperCase()
                void groupIdField.onChange(event)
              }}
              placeholder="예: WORK_STATUS"
              maxLength={50}
              readOnly={!!editTarget}
              className={`${formMonoInputClass} bg-[var(--surface)] ${
                editTarget ? 'bg-[var(--surface-alt)] text-[var(--text-muted)]' : ''
              }`}
            />
            {errors.groupId && <p className={formErrorClass}>{errors.groupId.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              그룹명 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              {...register('groupName')}
              placeholder="예: 작업 상태"
              maxLength={100}
              className={formInputClass}
            />
            {errors.groupName && <p className={formErrorClass}>{errors.groupName.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              설명
            </label>
            <input
              type="text"
              {...register('description')}
              placeholder="코드 그룹에 대한 설명"
              maxLength={255}
              className={formInputClass}
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

export default CodeGroupFormModal
