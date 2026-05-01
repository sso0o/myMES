import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Modal from '@/common/components/Modal'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import {
  formClass,
  formDisabledInputClass,
  formInputClass,
  formLabelClass,
} from '@/common/styles/form'
import type { ItemCreateRequest, ItemResponse, ItemUpdateRequest } from '../types'
import { useItemTypeOptions, useItemUnitOptions } from '../hooks/useItemQuery'
import { itemFormSchema, type ItemFormInput, type ItemFormValues } from '../schemas/itemSchema'

interface ItemFormModalProps {
  open: boolean
  editTarget: ItemResponse | null
  onClose: () => void
  onSubmit: (data: ItemCreateRequest | ItemUpdateRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const getDefaultValues = (editTarget: ItemResponse | null): ItemFormInput => ({
  itemName: editTarget?.itemName ?? '',
  unit: editTarget?.unit ?? '',
  itemTypeId: editTarget?.itemTypeId ?? '',
})

const ItemFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: ItemFormModalProps) => {
  const { data: itemTypeOptions = [] } = useItemTypeOptions()
  const { data: itemUnitOptions = [] } = useItemUnitOptions()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormInput, unknown, ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editTarget))
    }
  }, [editTarget, open, reset])

  const handleFormSubmit = (values: ItemFormValues) => {
    onSubmit({ itemName: values.itemName, unit: values.unit, itemTypeId: values.itemTypeId })
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? '품목 수정' : '품목 등록'} onClose={onClose}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
          {editTarget && (
            <div>
              <label className={formLabelClass}>
                품목코드
              </label>
              <input
                type="text"
                value={editTarget.itemCode}
                disabled
                className={formDisabledInputClass}
              />
            </div>
          )}

          <div>
            <label className={formLabelClass}>
              품목명 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              {...register('itemName')}
              placeholder="품목명을 입력하세요"
              maxLength={100}
              className={formInputClass}
            />
            {errors.itemName && <p className={formErrorClass}>{errors.itemName.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              품목구분 <span className="text-[var(--danger)]">*</span>
            </label>
            <select
                {...register('itemTypeId')}
                className={formInputClass}
            >
              <option value="">품목구분 선택</option>
              {itemTypeOptions
              .filter((opt) => opt.isActive)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.codeName}
                  </option>
              ))}
            </select>
            {errors.itemTypeId && <p className={formErrorClass}>{errors.itemTypeId.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              단위 <span className="text-[var(--danger)]">*</span>
            </label>
            <select
              {...register('unit')}
              className={formInputClass}
            >
              <option value="">단위 선택</option>
              {itemUnitOptions
                .filter((opt) => opt.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((opt) => (
                  <option key={opt.id} value={opt.codeName}>
                    {opt.codeName}
                  </option>
                ))}
            </select>
            {errors.unit && <p className={formErrorClass}>{errors.unit.message}</p>}
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

export default ItemFormModal
