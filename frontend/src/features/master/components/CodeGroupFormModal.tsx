import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { CodeGroupCreateRequest, CodeGroupResponse, CodeGroupUpdateRequest } from '../types'

interface CodeGroupFormModalProps {
  open: boolean
  editTarget: CodeGroupResponse | null
  onClose: () => void
  onSubmit: (data: CodeGroupCreateRequest | CodeGroupUpdateRequest) => void
  isLoading: boolean
}

const CodeGroupFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: CodeGroupFormModalProps) => {
  const [groupId, setGroupId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (editTarget) {
      setGroupId(editTarget.groupId)
      setGroupName(editTarget.groupName)
      setDescription(editTarget.description ?? '')
      return
    }
    setGroupId('')
    setGroupName('')
    setDescription('')
  }, [editTarget, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editTarget) {
      onSubmit({ groupName: groupName.trim(), description: description.trim() || undefined })
    } else {
      onSubmit({
        groupId: groupId.trim(),
        groupName: groupName.trim(),
        description: description.trim() || undefined,
      })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-strong)]">
            {editTarget ? '코드 그룹 수정' : '코드 그룹 등록'}
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
              그룹 ID <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value.toUpperCase())}
              placeholder="예: WORK_STATUS"
              maxLength={50}
              required
              disabled={!!editTarget}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-[var(--surface-alt)] disabled:text-[var(--text-muted)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              그룹명 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="예: 작업 상태"
              maxLength={100}
              required
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              설명
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="코드 그룹에 대한 설명"
              maxLength={255}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-[var(--text-base)] transition-colors hover:bg-[var(--surface-alt)]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : editTarget ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CodeGroupFormModal
