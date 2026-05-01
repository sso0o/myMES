import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
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
  const [codeName, setCodeName] = useState('')
  const [sortOrder, setSortOrder] = useState('')
  const [numberingPrefix, setNumberingPrefix] = useState('')

  useEffect(() => {
    if (editTarget) {
      setCodeName(editTarget.codeName)
      setSortOrder(String(editTarget.sortOrder))
      setNumberingPrefix(editTarget.numberingPrefix ?? '')
      return
    }

    setCodeName('')
    setSortOrder('')
    setNumberingPrefix('')
  }, [editTarget, open])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const order = parseInt(sortOrder, 10)
    const prefix = numberingPrefix.trim().toUpperCase() || undefined
    onSubmit({ codeName: codeName.trim(), sortOrder: order, numberingPrefix: prefix })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-strong)]">
            {editTarget ? 'Edit Code' : 'Create Code'}
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
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              Code
            </label>
            <input
              type="text"
              value={editTarget?.code ?? ''}
              placeholder="Generated on save"
              maxLength={50}
              disabled
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-[var(--surface-alt)] disabled:text-[var(--text-muted)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              Code Name
            </label>
            <input
              type="text"
              value={codeName}
              onChange={(event) => setCodeName(event.target.value)}
              placeholder="e.g. Waiting"
              maxLength={100}
              required
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              placeholder="1"
              min={1}
              required
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              Numbering Prefix
            </label>
            <input
              type="text"
              value={numberingPrefix}
              onChange={(event) => setNumberingPrefix(event.target.value.toUpperCase())}
              placeholder="e.g. RM, FG, WIP"
              maxLength={20}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
      </div>
    </div>
  )
}

export default CommonCodeFormModal
