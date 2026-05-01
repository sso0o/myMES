import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { useEquipmentTypeOptions } from '../hooks/useEquipmentQuery'
import type { EquipmentCreateRequest, EquipmentResponse, EquipmentUpdateRequest } from '../types'

interface EquipmentFormModalProps {
  open: boolean
  editTarget: EquipmentResponse | null
  onClose: () => void
  onSubmit: (data: EquipmentCreateRequest | EquipmentUpdateRequest) => void
  isLoading: boolean
}

const EquipmentFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: EquipmentFormModalProps) => {
  const [equipmentName, setEquipmentName] = useState('')
  const [equipmentTypeId, setEquipmentTypeId] = useState<number | null>(null)
  const [location, setLocation] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [modelName, setModelName] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)

  const { data: equipmentTypeOptions = [] } = useEquipmentTypeOptions()

  useEffect(() => {
    if (editTarget) {
      setEquipmentName(editTarget.equipmentName)
      setEquipmentTypeId(editTarget.equipmentTypeId ?? null)
      setLocation(editTarget.location ?? '')
      setManufacturer(editTarget.manufacturer ?? '')
      setModelName(editTarget.modelName ?? '')
      setPurchaseDate(editTarget.purchaseDate ?? '')
      setDescription(editTarget.description ?? '')
      setIsActive(editTarget.isActive)
      return
    }

    setEquipmentName('')
    setEquipmentTypeId(null)
    setLocation('')
    setManufacturer('')
    setModelName('')
    setPurchaseDate('')
    setDescription('')
    setIsActive(true)
  }, [editTarget, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      equipmentName: equipmentName.trim(),
      equipmentTypeId: equipmentTypeId ?? undefined,
      location: location.trim() || undefined,
      manufacturer: manufacturer.trim() || undefined,
      modelName: modelName.trim() || undefined,
      purchaseDate: purchaseDate || undefined,
      description: description.trim() || undefined,
      isActive,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-strong)]">
            {editTarget ? '설비 수정' : '설비 등록'}
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
                설비코드
              </label>
              <input
                type="text"
                value={editTarget.equipmentCode}
                disabled
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 font-mono text-sm text-[var(--text-muted)]"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              설비명 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              placeholder="설비명을 입력하세요"
              maxLength={100}
              required
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              설비유형
            </label>
            <select
              value={equipmentTypeId ?? ''}
              onChange={(e) => setEquipmentTypeId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">설비유형 선택</option>
              {equipmentTypeOptions
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
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">위치</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="설비 위치를 입력하세요"
              maxLength={200}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
                제조사
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="제조사"
                maxLength={100}
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
                모델명
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="모델명"
                maxLength={100}
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">
              구입일
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-base)]">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설비에 대한 설명을 입력하세요"
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
      </div>
    </div>
  )
}

export default EquipmentFormModal
