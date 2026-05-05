import type { PlanStatus } from '../types'

interface PlanStatusBadgeProps {
  status: PlanStatus
}

const STATUS_CONFIG: Record<PlanStatus, { label: string; className: string }> = {
  DRAFT: {
    label: '초안',
    className: 'bg-[var(--surface-alt)] text-[var(--text-muted)]',
  },
  CONFIRMED: {
    label: '확정',
    className: 'bg-[var(--primary-soft)] text-[var(--primary)]',
  },
  RELEASED: {
    label: '작업지시 발행',
    className: 'bg-[var(--success-soft)] text-[var(--success)]',
  },
  CLOSED: {
    label: '완료',
    className: 'bg-[var(--surface-alt)] text-[var(--text-base)]',
  },
}

const PlanStatusBadge = ({ status }: PlanStatusBadgeProps) => {
  const { label, className } = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}

export default PlanStatusBadge
