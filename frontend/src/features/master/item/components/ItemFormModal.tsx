import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import Modal from '@/common/components/Modal'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import AppTextField from '@/common/components/AppTextField'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import {
  formClass,
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
    control,
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
              <AppTextField
                value={editTarget.itemCode}
                disabled
                sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
              />
            </div>
          )}

          <div>
            <label className={formLabelClass}>
              품목명 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppTextField
              {...register('itemName')}
              placeholder="품목명을 입력하세요"
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            {errors.itemName && <p className={formErrorClass}>{errors.itemName.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              품목구분 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="itemTypeId"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={field.value === '' ? '' : String(field.value)}>
                  <AppMenuItem value="">품목구분 선택</AppMenuItem>
                  {itemTypeOptions
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
            {errors.itemTypeId && <p className={formErrorClass}>{errors.itemTypeId.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              단위 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={field.value}>
                  <AppMenuItem value="">단위 선택</AppMenuItem>
                  {itemUnitOptions
                    .filter((opt) => opt.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((opt) => (
                      <AppMenuItem key={opt.id} value={opt.codeName}>
                        {opt.codeName}
                      </AppMenuItem>
                    ))}
                </AppSelect>
              )}
            />
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
