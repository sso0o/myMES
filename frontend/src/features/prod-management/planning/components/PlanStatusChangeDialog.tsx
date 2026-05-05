import { X } from 'lucide-react'
import { cancelButtonClass } from '@/common/styles/button'
import { PlanStatus, type ProductionPlanResponse } from '../types'

interface PlanStatusChangeDialogProps {
  plan: ProductionPlanResponse
  targetStatus: PlanStatus
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

const STATUS_MESSAGES: Partial<Record<PlanStatus, { title: string; description: string; confirmLabel: string; confirmClass: string }>> = {
  [PlanStatus.CONFIRMED]: {
    title: '생산계획 확정',
    description: '해당 계획을 확정하면 수정 및 삭제가 불가능합니다.',
    confirmLabel: '확정',
    confirmClass:
      'rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50',
  },
  [PlanStatus.RELEASED]: {
    title: '작업지시 발행',
    description: '확정된 계획에 대한 작업지시가 자동으로 생성됩니다. 발행 후 취소할 수 없습니다.',
    confirmLabel: '발행',
    confirmClass:
      'rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50',
  },
  [PlanStatus.DRAFT]: {
    title: '초안으로 되돌리기',
    description: '확정된 계획을 초안 상태로 되돌립니다.',
    confirmLabel: '되돌리기',
    confirmClass:
      'rounded-lg bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--text-base)] transition-colors hover:bg-[var(--border)] disabled:opacity-50',
  },
  [PlanStatus.CLOSED]: {
    title: '생산계획 완료 처리',
    description: '해당 계획을 완료 처리합니다. 이후 상태 변경이 불가능합니다.',
    confirmLabel: '완료 처리',
    confirmClass:
      'rounded-lg bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--text-base)] transition-colors hover:bg-[var(--border)] disabled:opacity-50',
  },
}

const PlanStatusChangeDialog = ({
  plan,
  targetStatus,
  isLoading,
  onConfirm,
  onCancel,
}: PlanStatusChangeDialogProps) => {
  const config = STATUS_MESSAGES[targetStatus]
  if (!config) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-strong)]">{config.title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-1 text-sm text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-base)]">{plan.planNo}</span>{' '}
          ({plan.itemName})
        </div>
        <p className="mb-5 text-sm text-[var(--text-muted)]">{config.description}</p>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={cancelButtonClass}>
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={config.confirmClass}
          >
            {isLoading ? '처리 중...' : config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlanStatusChangeDialog
