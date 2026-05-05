import { X } from 'lucide-react'
import { cancelButtonClass } from '@/common/styles/button'

interface BulkActionDialogProps {
  action: 'confirm' | 'release'
  selectedCount: number
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

const CONFIG = {
  confirm: {
    title: '일괄 확정',
    description: (count: number) =>
      `${count}개의 생산계획을 확정합니다. 확정 후 수정·삭제가 불가능합니다.`,
    confirmLabel: (count: number) => `${count}개 확정`,
    confirmClass:
      'rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50',
  },
  release: {
    title: '일괄 작업지시 발행',
    description: (count: number) =>
      `${count}개의 생산계획에 대한 작업지시를 발행합니다. 발행 후 취소할 수 없으며, 작업지시 ${count}건이 자동 생성됩니다.`,
    confirmLabel: (count: number) => `${count}개 발행`,
    confirmClass:
      'rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50',
  },
}

const BulkActionDialog = ({
  action,
  selectedCount,
  isLoading,
  onConfirm,
  onCancel,
}: BulkActionDialogProps) => {
  const config = CONFIG[action]

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

        <p className="mb-5 text-sm text-[var(--text-muted)]">{config.description(selectedCount)}</p>

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
            {isLoading ? '처리 중...' : config.confirmLabel(selectedCount)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BulkActionDialog
