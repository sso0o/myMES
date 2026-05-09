import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import Modal from '@/common/components/Modal'
import AppNumberField from '@/common/components/AppNumberField'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import AppTextField from '@/common/components/AppTextField'
import AppTextarea from '@/common/components/AppTextarea'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { formClass, formLabelClass } from '@/common/styles/form'
import { useInspectionItemCategoryOptions, useUnitOptions } from '../hooks/useInspectionItemQuery'
import {
  inspectionItemFormSchema,
  type InspectionItemFormInput,
  type InspectionItemFormValues,
} from '../schemas/inspectionItemSchema'
import {
  MeasurementType,
  MEASUREMENT_TYPE_LABEL,
  type InspectionItemCreateRequest,
  type InspectionItemResponse,
  type InspectionItemUpdateRequest,
} from '../types'

interface InspectionItemFormModalProps {
  open: boolean
  editTarget: InspectionItemResponse | null
  onClose: () => void
  onSubmit: (data: InspectionItemCreateRequest | InspectionItemUpdateRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const getDefaultValues = (editTarget: InspectionItemResponse | null): InspectionItemFormInput => ({
  inspectionItemName: editTarget?.inspectionItemName ?? '',
  categoryCode: editTarget?.categoryCode ?? '',
  measurementType: editTarget?.measurementType ?? MeasurementType.NUMERIC,
  unit: editTarget?.unit ?? '',
  decimalScale: editTarget?.decimalScale ?? '',
  description: editTarget?.description ?? '',
  sortOrder: editTarget?.sortOrder ?? '',
  isActive: editTarget?.isActive ?? true,
})

const InspectionItemFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: InspectionItemFormModalProps) => {
  const { data: categoryOptions = [] } = useInspectionItemCategoryOptions()
  const { data: unitOptions = [] } = useUnitOptions()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<InspectionItemFormInput, unknown, InspectionItemFormValues>({
    resolver: zodResolver(inspectionItemFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })

  const isActive = useWatch({ control, name: 'isActive' }) ?? true

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editTarget))
    }
  }, [editTarget, open, reset])

  const handleFormSubmit = (values: InspectionItemFormValues) => {
    const data = {
      inspectionItemName: values.inspectionItemName,
      categoryCode: values.categoryCode,
      measurementType: values.measurementType,
      unit: values.unit,
      decimalScale: values.decimalScale,
      description: values.description,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    }

    onSubmit(data)
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? '검사항목 수정' : '검사항목 등록'} onClose={onClose}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
        {editTarget && (
          <div>
            <label className={formLabelClass}>검사항목코드</label>
            <AppTextField
              value={editTarget.inspectionItemCode}
              disabled
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
            />
          </div>
        )}

        <div>
          <label className={formLabelClass}>
            검사항목명 <span className="text-[var(--danger)]">*</span>
          </label>
          <AppTextField
            {...register('inspectionItemName')}
            placeholder="검사항목명을 입력하세요"
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          {errors.inspectionItemName && (
            <p className={formErrorClass}>{errors.inspectionItemName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={formLabelClass}>
              검사항목분류 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="categoryCode"
              control={control}
              render={({ field }) => (
                <AppSelect {...field}>
                  <AppMenuItem value="">분류 선택</AppMenuItem>
                  {categoryOptions
                    .filter((option) => option.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((option) => (
                      <AppMenuItem key={option.id} value={option.code}>
                        {option.codeName}
                      </AppMenuItem>
                    ))}
                </AppSelect>
              )}
            />
            {errors.categoryCode && <p className={formErrorClass}>{errors.categoryCode.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              측정방식 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="measurementType"
              control={control}
              render={({ field }) => (
                <AppSelect {...field}>
                  {Object.values(MeasurementType).map((type) => (
                    <AppMenuItem key={type} value={type}>
                      {MEASUREMENT_TYPE_LABEL[type]}
                    </AppMenuItem>
                  ))}
                </AppSelect>
              )}
            />
            {errors.measurementType && (
              <p className={formErrorClass}>{errors.measurementType.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={formLabelClass}>단위</label>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={field.value ?? ''}>
                  <AppMenuItem value="">단위 선택</AppMenuItem>
                  {unitOptions
                    .filter((option) => option.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((option) => (
                      <AppMenuItem key={option.id} value={option.codeName}>
                        {option.codeName}
                      </AppMenuItem>
                    ))}
                </AppSelect>
              )}
            />
            {errors.unit && <p className={formErrorClass}>{errors.unit.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>소수점 자리수</label>
            <AppNumberField
              {...register('decimalScale')}
              placeholder="0"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            {errors.decimalScale && (
              <p className={formErrorClass}>{errors.decimalScale.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>정렬순서</label>
            <AppNumberField
              {...register('sortOrder')}
              placeholder="0"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            {errors.sortOrder && <p className={formErrorClass}>{errors.sortOrder.message}</p>}
          </div>
        </div>

        <div>
          <label className={formLabelClass}>설명</label>
          <AppTextarea
            {...register('description')}
            placeholder="검사항목 설명을 입력하세요"
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

export default InspectionItemFormModal
