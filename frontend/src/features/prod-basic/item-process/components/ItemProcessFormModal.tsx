import { useState } from 'react'
import Modal from '@/common/components/Modal'
import AppNumberField from '@/common/components/AppNumberField'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { formClass, formLabelClass } from '@/common/styles/form'
import { useProcessList } from '@/features/prod-basic/process/hooks/useProcessQuery'
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
  const [processId, setProcessId] = useState<number | null>(editTarget?.processId ?? null)
  const [sequence, setSequence] = useState<number>(editTarget?.sequence ?? 1)

  const { data: processes = [] } = useProcessList()
  const activeProcesses = processes.filter((p) => p.isActive)

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
    <Modal title={editTarget ? '공정 수정' : '공정 추가'} onClose={onClose}>
        <form onSubmit={handleSubmit} className={formClass}>
          <div>
            <label className={formLabelClass}>
              공정 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppSelect
              value={processId === null ? '' : String(processId)}
              onChange={(e) => setProcessId(e.target.value ? Number(e.target.value) : null)}
              required
            >
              <AppMenuItem value="">공정 선택</AppMenuItem>
              {activeProcesses.map((p) => (
                <AppMenuItem key={p.id} value={String(p.id)}>
                  {p.processCode} — {p.processName}
                </AppMenuItem>
              ))}
            </AppSelect>
          </div>

          <div>
            <label className={formLabelClass}>
              순서 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppNumberField
              value={sequence}
              onChange={(e) => setSequence(Number(e.target.value))}
              required
              slotProps={{ htmlInput: { min: 1 } }}
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
    </Modal>
  )
}

export default ItemProcessFormModal
