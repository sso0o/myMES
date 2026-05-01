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
  const [equipmentName, setEquipmentName] = useState(editTarget?.equipmentName ?? '')
  const [equipmentTypeId, setEquipmentTypeId] = useState<number | null>(
    editTarget?.equipmentTypeId ?? null,
  )
  const [location, setLocation] = useState(editTarget?.location ?? '')
  const [manufacturer, setManufacturer] = useState(editTarget?.manufacturer ?? '')
  const [modelName, setModelName] = useState(editTarget?.modelName ?? '')
  const [purchaseDate, setPurchaseDate] = useState(editTarget?.purchaseDate ?? '')
  const [description, setDescription] = useState(editTarget?.description ?? '')
  const [isActive, setIsActive] = useState(editTarget?.isActive ?? true)

  const { data: equipmentTypeOptions = [] } = useEquipmentTypeOptions()

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
    <Modal title={editTarget ? '설비 수정' : '설비 등록'} onClose={onClose}>
        <form onSubmit={handleSubmit} className={formClass}>
          {editTarget && (
            <div>
              <label className={formLabelClass}>
                설비코드
              </label>
              <input
                type="text"
                value={editTarget.equipmentCode}
                disabled
                className={formDisabledInputClass}
              />
            </div>
          )}

          <div>
            <label className={formLabelClass}>
              설비명 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              placeholder="설비명을 입력하세요"
              maxLength={100}
              required
              className={formInputClass}
            />
          </div>

          <div>
            <label className={formLabelClass}>
              설비유형
            </label>
            <select
              value={equipmentTypeId ?? ''}
              onChange={(e) => setEquipmentTypeId(e.target.value ? Number(e.target.value) : null)}
              className={formInputClass}
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
            <label className={formLabelClass}>위치</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="설비 위치를 입력하세요"
              maxLength={200}
              className={formInputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={formLabelClass}>
                제조사
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="제조사"
                maxLength={100}
                className={formInputClass}
              />
            </div>
            <div>
              <label className={formLabelClass}>
                모델명
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="모델명"
                maxLength={100}
                className={formInputClass}
              />
            </div>
          </div>

          <div>
            <label className={formLabelClass}>
              구입일
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className={formInputClass}
            />
          </div>

          <div>
            <label className={formLabelClass}>설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설비에 대한 설명을 입력하세요"
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

export default EquipmentFormModal
