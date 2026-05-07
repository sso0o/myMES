import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '@/common/components/Modal'
import AppDateTimePicker from '@/common/components/AppDateTimePicker'
import AppNumberField from '@/common/components/AppNumberField'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { formClass, formLabelClass } from '@/common/styles/form'
import {
  productionRecordFormSchema,
  type ProductionRecordFormInput,
  type ProductionRecordFormValues,
} from '../schemas/productionRecordSchema'
import type { ProductionRecordResponse } from '../types'

interface ProductionRecordFormModalProps {
  open: boolean
  editTarget: ProductionRecordResponse | null
  onClose: () => void
  onSubmit: (data: ProductionRecordFormValues) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const getDefaultValues = (
  editTarget: ProductionRecordResponse | null,
): ProductionRecordFormInput => ({
  startedAt: editTarget?.startedAt ?? '',
  endedAt: editTarget?.endedAt ?? '',
  inputQty: editTarget?.inputQty ?? ('' as unknown as number),
  completedQty: editTarget?.completedQty ?? ('' as unknown as number),
  defectQty: editTarget?.defectQty ?? 0,
})

const ProductionRecordFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: ProductionRecordFormModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductionRecordFormInput, unknown, ProductionRecordFormValues>({
    resolver: zodResolver(productionRecordFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })

  useEffect(() => {
    if (open) reset(getDefaultValues(editTarget))
  }, [editTarget, open, reset])

  if (!open) return null

  return (
    <Modal
      title={editTarget ? '생산실적 수정' : '생산실적 등록'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className={formClass}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={formLabelClass}>시작일시</label>
            <Controller
              name="startedAt"
              control={control}
              render={({ field }) => (
                <AppDateTimePicker value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <div>
            <label className={formLabelClass}>종료일시</label>
            <Controller
              name="endedAt"
              control={control}
              render={({ field }) => (
                <AppDateTimePicker value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={formLabelClass}>
              투입수량 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppNumberField
              {...register('inputQty')}
              placeholder="0"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            {errors.inputQty && (
              <p className={formErrorClass}>{errors.inputQty.message}</p>
            )}
          </div>
          <div>
            <label className={formLabelClass}>
              양품수량 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppNumberField
              {...register('completedQty')}
              placeholder="0"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            {errors.completedQty && (
              <p className={formErrorClass}>{errors.completedQty.message}</p>
            )}
          </div>
          <div>
            <label className={formLabelClass}>불량수량</label>
            <AppNumberField
              {...register('defectQty')}
              placeholder="0"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            {errors.defectQty && (
              <p className={formErrorClass}>{errors.defectQty.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={cancelButtonClass}>
            취소
          </button>
          <button type="submit" disabled={isLoading} className={submitButtonClass}>
            {isLoading ? '저장 중...' : editTarget ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ProductionRecordFormModal
