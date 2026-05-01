import { useState } from 'react'
import Modal from '@/common/components/Modal'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import {
  formClass,
  formDisabledInputClass,
  formInputClass,
  formLabelClass,
  formTextareaClass,
} from '@/common/styles/form'
import { useProcessTypeOptions } from '../hooks/useProcessQuery'
import type { ProcessCreateRequest, ProcessResponse, ProcessUpdateRequest } from '../types'

interface ProcessFormModalProps {
  open: boolean
  editTarget: ProcessResponse | null
  onClose: () => void
  onSubmit: (data: ProcessCreateRequest | ProcessUpdateRequest) => void
  isLoading: boolean
}

const ProcessFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: ProcessFormModalProps) => {
  const [processName, setProcessName] = useState(editTarget?.processName ?? '')
  const [processTypeId, setProcessTypeId] = useState<number | null>(
    editTarget?.processTypeId ?? null,
  )
  const [standardTime, setStandardTime] = useState<number>(editTarget?.standardTime ?? 0)
  const [description, setDescription] = useState(editTarget?.description ?? '')
  const [isActive, setIsActive] = useState(editTarget?.isActive ?? true)

  const { data: processTypeOptions = [] } = useProcessTypeOptions()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      processName: processName.trim(),
      processTypeId: processTypeId ?? undefined,
      standardTime: standardTime || undefined,
      description: description.trim() || undefined,
      isActive,
    })
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? '공정 수정' : '공정 등록'} onClose={onClose}>
        <form onSubmit={handleSubmit} className={formClass}>
          {editTarget && (
            <div>
              <label className={formLabelClass}>
                공정코드
              </label>
              <input
                type="text"
                value={editTarget.processCode}
                disabled
                className={formDisabledInputClass}
              />
            </div>
          )}

          <div>
            <label className={formLabelClass}>
              공정명 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="공정명을 입력하세요"
              maxLength={100}
              required
              className={formInputClass}
            />
          </div>

          <div>
            <label className={formLabelClass}>
              공정유형
            </label>
            <select
              value={processTypeId ?? ''}
              onChange={(e) => setProcessTypeId(e.target.value ? Number(e.target.value) : null)}
              className={formInputClass}
            >
              <option value="">공정유형 선택</option>
              {processTypeOptions
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
              표준시간(분)
            </label>
            <input
              type="number"
              value={standardTime}
              onChange={(e) => setStandardTime(Number(e.target.value))}
              min={0}
              placeholder="0"
              className={formInputClass}
            />
          </div>

          <div>
            <label className={formLabelClass}>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="공정에 대한 설명을 입력하세요"
              rows={3}
              maxLength={500}
              className={formTextareaClass}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[var(--text-base)]">사용여부</label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                isActive ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                  isActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm text-[var(--text-muted)]">{isActive ? '사용' : '미사용'}</span>
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

export default ProcessFormModal
