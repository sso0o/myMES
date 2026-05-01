import { useState } from 'react'
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

interface ItemFormModalProps {
  open: boolean
  editTarget: ItemResponse | null
  onClose: () => void
  onSubmit: (data: ItemCreateRequest | ItemUpdateRequest) => void
  isLoading: boolean
}

const ItemFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: ItemFormModalProps) => {
  const [itemName, setItemName] = useState(editTarget?.itemName ?? '')
  const [unit, setUnit] = useState(editTarget?.unit ?? '')
  const [itemTypeId, setItemTypeId] = useState<number | null>(editTarget?.itemTypeId ?? null)

  const { data: itemTypeOptions = [] } = useItemTypeOptions()
  const { data: itemUnitOptions = [] } = useItemUnitOptions()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (itemTypeId === null) return

    onSubmit({ itemName: itemName.trim(), unit: unit.trim(), itemTypeId })
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? '품목 수정' : '품목 등록'} onClose={onClose}>
        <form onSubmit={handleSubmit} className={formClass}>
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
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="품목명을 입력하세요"
              maxLength={100}
              required
              className={formInputClass}
            />
          </div>

          <div>
            <label className={formLabelClass}>
              품목구분 <span className="text-[var(--danger)]">*</span>
            </label>
            <select
                value={itemTypeId ?? ''}
                onChange={(e) => setItemTypeId(e.target.value ? Number(e.target.value) : null)}
                required
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
          </div>

          <div>
            <label className={formLabelClass}>
              단위 <span className="text-[var(--danger)]">*</span>
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
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
