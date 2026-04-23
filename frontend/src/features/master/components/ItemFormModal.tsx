import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
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
  const [itemName, setItemName] = useState('')
  const [unit, setUnit] = useState('')
  const [itemTypeId, setItemTypeId] = useState<number | null>(null)

  const { data: itemTypeOptions = [] } = useItemTypeOptions()
  const { data: itemUnitOptions = [] } = useItemUnitOptions()

  useEffect(() => {
    if (editTarget) {
      setItemName(editTarget.itemName)
      setUnit(editTarget.unit)
      setItemTypeId(editTarget.itemTypeId ?? null)
      return
    }

    setItemName('')
    setUnit('')
    setItemTypeId(null)
  }, [editTarget, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (itemTypeId === null) return

    onSubmit({ itemName: itemName.trim(), unit: unit.trim(), itemTypeId })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-strong)]">
            {editTarget ? '품목 수정' : '품목 등록'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--text-base)]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {editTarget && (
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
                품목코드
              </label>
              <input
                type="text"
                value={editTarget.itemCode}
                disabled
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 font-mono text-sm text-[var(--text-muted)]"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              품목명 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="품목명을 입력하세요"
              maxLength={100}
              required
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              품목구분 <span className="text-[var(--danger)]">*</span>
            </label>
            <select
                value={itemTypeId ?? ''}
                onChange={(e) => setItemTypeId(e.target.value ? Number(e.target.value) : null)}
                required
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              단위 <span className="text-[var(--danger)]">*</span>
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
      </div>
    </div>
  )
}

export default ItemFormModal
