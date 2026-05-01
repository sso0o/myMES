import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import Modal from '@/common/components/Modal'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import {
  formClass,
  formDisabledInputClass,
  formInputClass,
  formLabelClass,
  formTextareaClass,
} from '@/common/styles/form'
import { useEquipmentTypeOptions } from '../hooks/useEquipmentQuery'
import {
  equipmentFormSchema,
  type EquipmentFormInput,
  type EquipmentFormValues,
} from '../schemas/equipmentSchema'
import type { EquipmentCreateRequest, EquipmentResponse, EquipmentUpdateRequest } from '../types'

interface EquipmentFormModalProps {
  open: boolean
  editTarget: EquipmentResponse | null
  onClose: () => void
  onSubmit: (data: EquipmentCreateRequest | EquipmentUpdateRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const getDefaultValues = (editTarget: EquipmentResponse | null): EquipmentFormInput => ({
  equipmentName: editTarget?.equipmentName ?? '',
  equipmentTypeId: editTarget?.equipmentTypeId ?? '',
  location: editTarget?.location ?? '',
  manufacturer: editTarget?.manufacturer ?? '',
  modelName: editTarget?.modelName ?? '',
  purchaseDate: editTarget?.purchaseDate ?? '',
  description: editTarget?.description ?? '',
  isActive: editTarget?.isActive ?? true,
})

const EquipmentFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: EquipmentFormModalProps) => {
  const { data: equipmentTypeOptions = [] } = useEquipmentTypeOptions()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<EquipmentFormInput, unknown, EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })

  const isActive = useWatch({ control, name: 'isActive' }) ?? true

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editTarget))
    }
  }, [editTarget, open, reset])

  const handleFormSubmit = (values: EquipmentFormValues) => {
    onSubmit({
      equipmentName: values.equipmentName,
      equipmentTypeId: values.equipmentTypeId,
      location: values.location,
      manufacturer: values.manufacturer,
      modelName: values.modelName,
      purchaseDate: values.purchaseDate,
      description: values.description,
      isActive: values.isActive,
    })
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? '설비 수정' : '설비 등록'} onClose={onClose}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
          {editTarget && (
            <div>
              <label className={formLabelClass}>
                설비코드
              </label>
              <input
                type="text"
                value={editTarget.equipmentCode}
                disabled
                className={formDisabledInputClass}
              />
            </div>
          )}

          <div>
            <label className={formLabelClass}>
              설비명 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              {...register('equipmentName')}
              placeholder="설비명을 입력하세요"
              maxLength={100}
              className={formInputClass}
            />
            {errors.equipmentName && (
              <p className={formErrorClass}>{errors.equipmentName.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>
              설비유형
            </label>
            <select
              {...register('equipmentTypeId')}
              className={formInputClass}
            >
              <option value="">설비유형 선택</option>
              {equipmentTypeOptions
                .filter((opt) => opt.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.codeName}
                  </option>
                ))}
            </select>
            {errors.equipmentTypeId && (
              <p className={formErrorClass}>{errors.equipmentTypeId.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>위치</label>
            <input
              type="text"
              {...register('location')}
              placeholder="설비 위치를 입력하세요"
              maxLength={200}
              className={formInputClass}
            />
            {errors.location && <p className={formErrorClass}>{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={formLabelClass}>
                제조사
              </label>
              <input
                type="text"
                {...register('manufacturer')}
                placeholder="제조사"
                maxLength={100}
                className={formInputClass}
              />
              {errors.manufacturer && (
                <p className={formErrorClass}>{errors.manufacturer.message}</p>
              )}
            </div>
            <div>
              <label className={formLabelClass}>
                모델명
              </label>
              <input
                type="text"
                {...register('modelName')}
                placeholder="모델명"
                maxLength={100}
                className={formInputClass}
              />
              {errors.modelName && <p className={formErrorClass}>{errors.modelName.message}</p>}
            </div>
          </div>

          <div>
            <label className={formLabelClass}>
              구입일
            </label>
            <input
              type="date"
              {...register('purchaseDate')}
              className={formInputClass}
            />
            {errors.purchaseDate && (
              <p className={formErrorClass}>{errors.purchaseDate.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>설명</label>
            <textarea
              {...register('description')}
              placeholder="설비에 대한 설명을 입력하세요"
              rows={3}
              maxLength={500}
              className={formTextareaClass}
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

export default EquipmentFormModal
