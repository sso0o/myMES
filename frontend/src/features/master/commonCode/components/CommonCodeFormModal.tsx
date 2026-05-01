import { useState } from 'react'
import Modal from '@/common/components/Modal'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import {
  formClass,
  formInputClass,
  formLabelClass,
  formMonoInputClass,
} from '@/common/styles/form'
import type { CommonCodeCreateRequest, CommonCodeResponse, CommonCodeUpdateRequest } from '../types'

interface CommonCodeFormModalProps {
  open: boolean
  editTarget: CommonCodeResponse | null
  onClose: () => void
  onSubmit: (data: CommonCodeCreateRequest | CommonCodeUpdateRequest) => void
  isLoading: boolean
}

const CommonCodeFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: CommonCodeFormModalProps) => {
  const [codeName, setCodeName] = useState(editTarget?.codeName ?? '')
  const [sortOrder, setSortOrder] = useState(editTarget ? String(editTarget.sortOrder) : '')
  const [numberingPrefix, setNumberingPrefix] = useState(editTarget?.numberingPrefix ?? '')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const order = parseInt(sortOrder, 10)
    const prefix = numberingPrefix.trim().toUpperCase() || undefined
    onSubmit({ codeName: codeName.trim(), sortOrder: order, numberingPrefix: prefix })
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? 'Edit Code' : 'Create Code'} onClose={onClose}>
        <form onSubmit={handleSubmit} className={formClass}>
          <div>
            <label className={formLabelClass}>
              Code
            </label>
            <input
              type="text"
              value={editTarget?.code ?? ''}
              placeholder="Generated on save"
              maxLength={50}
              disabled
              className={`${formMonoInputClass} bg-[var(--surface)] disabled:bg-[var(--surface-alt)] disabled:text-[var(--text-muted)]`}
            />
          </div>

          <div>
            <label className={formLabelClass}>
              Code Name
            </label>
            <input
              type="text"
              value={codeName}
              onChange={(event) => setCodeName(event.target.value)}
              placeholder="e.g. Waiting"
              maxLength={100}
              required
              className={formInputClass}
            />
          </div>

          <div>
            <label className={formLabelClass}>
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              placeholder="1"
              min={1}
              required
              className={formInputClass}
            />
          </div>

          <div>
            <label className={formLabelClass}>
              Numbering Prefix
            </label>
            <input
              type="text"
              value={numberingPrefix}
              onChange={(event) => setNumberingPrefix(event.target.value.toUpperCase())}
              placeholder="e.g. RM, FG, WIP"
              maxLength={20}
              className={formMonoInputClass}
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Used for downstream numbering, for example `RM-000001`.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={cancelButtonClass}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className={submitButtonClass}>
              {isLoading ? 'Saving...' : editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
    </Modal>
  )
}

export default CommonCodeFormModal
