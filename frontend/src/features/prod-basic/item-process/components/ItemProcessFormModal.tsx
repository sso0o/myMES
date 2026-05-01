import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { useProcessList } from '@/features/master/process/hooks/useProcessQuery'
import type { ItemProcessCreateRequest, ItemProcessResponse, ItemProcessUpdateRequest } from '../types'

interface ItemProcessFormModalProps {
  open: boolean
  itemId: number
  editTarget: ItemProcessResponse | null
  onClose: () => void
  onSubmit: (data: ItemProcessCreateRequest | ItemProcessUpdateRequest) => void
  isLoading: boolean
}

const ItemProcessFormModal = ({
  open,
  itemId,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: ItemProcessFormModalProps) => {
  const [processId, setProcessId] = useState<number | null>(null)
  const [sequence, setSequence] = useState<number>(1)

  const { data: processes = [] } = useProcessList()
  const activeProcesses = processes.filter((p) => p.isActive)

  useEffect(() => {
    if (editTarget) {
      setProcessId(editTarget.processId)
      setSequence(editTarget.sequence)
      return
    }
    setProcessId(null)
    setSequence(1)
  }, [editTarget, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (processId === null) return

    if (editTarget) {
      onSubmit({ processId, sequence } satisfies ItemProcessUpdateRequest)
    } else {
      onSubmit({ itemId, processId, sequence } satisfies ItemProcessCreateRequest)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-strong)]">
            {editTarget ? '공정 수정' : '공정 추가'}
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
              공정 <span className="text-[var(--danger)]">*</span>
            </label>
            <select
              value={processId ?? ''}
              onChange={(e) => setProcessId(e.target.value ? Number(e.target.value) : null)}
              required
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">공정 선택</option>
              {activeProcesses.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.processCode} — {p.processName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              순서 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={sequence}
              onChange={(e) => setSequence(Number(e.target.value))}
              required
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={cancelButtonClass}>
              취소
            </button>
            <button type="submit" disabled={isLoading} className={submitButtonClass}>
              {isLoading ? '처리 중...' : editTarget ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemProcessFormModal
