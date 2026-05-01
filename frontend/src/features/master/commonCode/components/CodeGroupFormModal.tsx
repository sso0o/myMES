import { useState } from 'react'
import Modal from '@/common/components/Modal'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import {
  formClass,
  formInputClass,
  formLabelClass,
  formMonoInputClass,
} from '@/common/styles/form'
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
  const [groupId, setGroupId] = useState(editTarget?.groupId ?? '')
  const [groupName, setGroupName] = useState(editTarget?.groupName ?? '')
  const [description, setDescription] = useState(editTarget?.description ?? '')

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
    <Modal title={editTarget ? '코드 그룹 수정' : '코드 그룹 등록'} onClose={onClose}>
        <form onSubmit={handleSubmit} className={formClass}>
          <div>
            <label className={formLabelClass}>
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
              className={`${formMonoInputClass} bg-[var(--surface)] disabled:bg-[var(--surface-alt)] disabled:text-[var(--text-muted)]`}
            />
          </div>

          <div>
            <label className={formLabelClass}>
              그룹명 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="예: 작업 상태"
              maxLength={100}
              required
              className={formInputClass}
            />
          </div>

          <div>
            <label className={formLabelClass}>
              설명
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="코드 그룹에 대한 설명"
              maxLength={255}
              className={formInputClass}
            />
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

export default CodeGroupFormModal
