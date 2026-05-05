import { CheckCheck, ClipboardList, X } from 'lucide-react'

interface BulkActionBarProps {
  selectedCount: number
  action: 'confirm' | 'release'
  isLoading: boolean
  onExecute: () => void
  onClearSelection: () => void
}

const BulkActionBar = ({
  selectedCount,
  action,
  isLoading,
  onExecute,
  onClearSelection,
}: BulkActionBarProps) => {
  if (selectedCount === 0) return null

  const isConfirm = action === 'confirm'

  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] px-4 py-2.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClearSelection}
          className="rounded p-0.5 text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-[var(--text-inverse)]"
        >
          <X size={16} />
        </button>
        <span className="text-sm font-medium text-[var(--primary)]">
          {selectedCount}개 선택됨
        </span>
      </div>

      <button
        type="button"
        onClick={onExecute}
        disabled={isLoading}
        className={[
          'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
          isConfirm
            ? 'bg-[var(--primary)] text-[var(--text-inverse)] hover:bg-[var(--primary-hover)]'
            : 'bg-[var(--success)] text-white hover:opacity-90',
        ].join(' ')}
      >
        {isConfirm ? <CheckCheck size={15} /> : <ClipboardList size={15} />}
        {isLoading
          ? '처리 중...'
          : isConfirm
            ? `${selectedCount}개 일괄 확정`
            : `${selectedCount}개 작업지시 발행`}
      </button>
    </div>
  )
}

export default BulkActionBar
