import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import Modal from '@/common/components/Modal'
import AppNumberField from '@/common/components/AppNumberField'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import AppTextField from '@/common/components/AppTextField'
import AppTextarea from '@/common/components/AppTextarea'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { formClass, formLabelClass } from '@/common/styles/form'
import type { ItemResponse } from '@/features/master/item/types'
import type { ItemProcessResponse } from '@/features/prod-basic/item-process/types'
import {
  MeasurementType,
  MEASUREMENT_TYPE_LABEL,
  type InspectionItemResponse,
} from '@/features/quality/inspection-item/types'
import { useInspectionItemList, useUnitOptions } from '@/features/quality/inspection-item/hooks/useInspectionItemQuery'
import {
  inspectionStandardFormSchema,
  type InspectionStandardFormInput,
  type InspectionStandardFormValues,
} from '../schemas/inspectionStandardSchema'
import { useInspectionMethodOptions } from '../hooks/useInspectionStandardQuery'
import type {
  InspectionStandardCreateRequest,
  InspectionStandardResponse,
  InspectionStandardUpdateRequest,
} from '../types'

interface InspectionStandardFormModalProps {
  open: boolean
  selectedItem: ItemResponse
  selectedProcess: ItemProcessResponse
  editTarget: InspectionStandardResponse | null
  onClose: () => void
  onSubmit: (data: InspectionStandardCreateRequest | InspectionStandardUpdateRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'
const readOnlyFieldSx = { '& .MuiInputBase-input': { fontSize: '0.75rem' } }

const getDefaultValues = (
  editTarget: InspectionStandardResponse | null,
): InspectionStandardFormInput => ({
  inspectionItemId: editTarget?.inspectionItemId ?? '',
  measurementType: editTarget?.measurementType ?? MeasurementType.NUMERIC,
  inspectionMethodCode: editTarget?.inspectionMethodCode ?? '',
  standardValue: editTarget?.standardValue ?? '',
  lowerLimit: editTarget?.lowerLimit ?? '',
  upperLimit: editTarget?.upperLimit ?? '',
  unit: editTarget?.unit ?? '',
  sampleQty: editTarget?.sampleQty ?? '',
  isRequired: editTarget?.isRequired ?? true,
  sortOrder: editTarget?.sortOrder ?? '',
  isActive: editTarget?.isActive ?? true,
  description: editTarget?.description ?? '',
})

const InspectionStandardFormModal = ({
  open,
  selectedItem,
  selectedProcess,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: InspectionStandardFormModalProps) => {
  const { data: inspectionItems = [] } = useInspectionItemList()
  const { data: inspectionMethodOptions = [] } = useInspectionMethodOptions()
  const { data: unitOptions = [] } = useUnitOptions()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<InspectionStandardFormInput, unknown, InspectionStandardFormValues>({
    resolver: zodResolver(inspectionStandardFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })

  const inspectionItemId = useWatch({ control, name: 'inspectionItemId' })
  const measurementType = useWatch({ control, name: 'measurementType' }) ?? MeasurementType.NUMERIC
  const isRequired = useWatch({ control, name: 'isRequired' }) ?? true
  const isActive = useWatch({ control, name: 'isActive' }) ?? true

  const selectedInspectionItem = useMemo(
    () =>
      inspectionItems.find((item) => item.id === Number(inspectionItemId)) ??
      (editTarget
        ? ({
            id: editTarget.inspectionItemId,
            inspectionItemCode: editTarget.inspectionItemCode,
            inspectionItemName: editTarget.inspectionItemName,
            categoryId: 0,
            categoryCode: editTarget.categoryCode,
            categoryName: editTarget.categoryName,
            measurementType: editTarget.measurementType,
            unit: editTarget.unit,
            decimalScale: null,
            description: null,
            sortOrder: editTarget.sortOrder,
            isActive: true,
            createdAt: editTarget.createdAt,
            updatedAt: editTarget.updatedAt,
          } satisfies InspectionItemResponse)
        : null),
    [editTarget, inspectionItemId, inspectionItems],
  )

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editTarget))
    }
  }, [editTarget, open, reset])

  useEffect(() => {
    if (!selectedInspectionItem) return

    setValue('measurementType', selectedInspectionItem.measurementType, { shouldValidate: true })
    if (!editTarget && selectedInspectionItem.unit) {
      setValue('unit', selectedInspectionItem.unit, { shouldDirty: true })
    }
    if (selectedInspectionItem.measurementType !== MeasurementType.NUMERIC) {
      setValue('lowerLimit', '', { shouldValidate: true })
      setValue('upperLimit', '', { shouldValidate: true })
    }
  }, [editTarget, selectedInspectionItem, setValue])

  const handleFormSubmit = (values: InspectionStandardFormValues) => {
    const commonValues = {
      inspectionMethodCode: values.inspectionMethodCode,
      standardValue: values.standardValue,
      lowerLimit: values.measurementType === MeasurementType.NUMERIC ? values.lowerLimit : undefined,
      upperLimit: values.measurementType === MeasurementType.NUMERIC ? values.upperLimit : undefined,
      unit: values.unit,
      sampleQty: values.sampleQty,
      isRequired: values.isRequired,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
      description: values.description,
    }

    if (editTarget) {
      onSubmit(commonValues)
      return
    }

    onSubmit({
      itemId: selectedItem.id,
      processId: selectedProcess.processId,
      inspectionItemId: values.inspectionItemId,
      ...commonValues,
    })
  }

  if (!open) return null

  const isNumeric = measurementType === MeasurementType.NUMERIC

  return (
    <Modal title={editTarget ? '공정 검사항목 수정' : '공정 검사항목 등록'} onClose={onClose}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={formLabelClass}>품목</label>
            <AppTextField
              value={`${selectedItem.itemCode} / ${selectedItem.itemName}`}
              disabled
              sx={readOnlyFieldSx}
            />
          </div>

          <div>
            <label className={formLabelClass}>공정</label>
            <AppTextField
              value={`${selectedProcess.processCode} / ${selectedProcess.processName}`}
              disabled
              sx={readOnlyFieldSx}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={formLabelClass}>
              검사항목 <span className="text-[var(--danger)]">*</span>
            </label>
            {editTarget ? (
              <AppTextField
                value={`${editTarget.inspectionItemCode} / ${editTarget.inspectionItemName}`}
                disabled
                sx={readOnlyFieldSx}
              />
            ) : (
              <Controller
                name="inspectionItemId"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    value={field.value ? String(field.value) : ''}
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    <AppMenuItem value="">검사항목 선택</AppMenuItem>
                    {inspectionItems
                      .filter((item) => item.isActive)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((item) => (
                        <AppMenuItem key={item.id} value={String(item.id)}>
                          {item.inspectionItemCode} / {item.inspectionItemName}
                        </AppMenuItem>
                      ))}
                  </AppSelect>
                )}
              />
            )}
            {errors.inspectionItemId && (
              <p className={formErrorClass}>{errors.inspectionItemId.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>측정방식</label>
            <AppTextField value={MEASUREMENT_TYPE_LABEL[measurementType]} disabled sx={readOnlyFieldSx} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={formLabelClass}>
              검사방식 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="inspectionMethodCode"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={field.value ?? ''}>
                  <AppMenuItem value="">검사방식 선택</AppMenuItem>
                  {inspectionMethodOptions
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
            {errors.inspectionMethodCode && (
              <p className={formErrorClass}>{errors.inspectionMethodCode.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>기준값</label>
            <AppTextField
              {...register('standardValue')}
              placeholder="예: 10.5 또는 OK"
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            {errors.standardValue && (
              <p className={formErrorClass}>{errors.standardValue.message}</p>
            )}
          </div>

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
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className={formLabelClass}>하한</label>
            <AppNumberField
              {...register('lowerLimit')}
              disabled={!isNumeric}
              placeholder={isNumeric ? '0' : '수치형만 입력'}
            />
            {errors.lowerLimit && <p className={formErrorClass}>{errors.lowerLimit.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>상한</label>
            <AppNumberField
              {...register('upperLimit')}
              disabled={!isNumeric}
              placeholder={isNumeric ? '0' : '수치형만 입력'}
            />
            {errors.upperLimit && <p className={formErrorClass}>{errors.upperLimit.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>샘플수</label>
            <AppNumberField
              {...register('sampleQty')}
              placeholder="1"
              slotProps={{ htmlInput: { min: 1 } }}
            />
            {errors.sampleQty && <p className={formErrorClass}>{errors.sampleQty.message}</p>}
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
            placeholder="검사 기준 설명을 입력하세요"
            rows={3}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          {errors.description && <p className={formErrorClass}>{errors.description.message}</p>}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[var(--text-base)]">필수여부</label>
            <button
              type="button"
              onClick={() => setValue('isRequired', !isRequired, { shouldDirty: true })}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                isRequired ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                  isRequired ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-[var(--text-muted)]">{isRequired ? '필수' : '선택'}</span>
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

export default InspectionStandardFormModal
