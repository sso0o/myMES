import { PlanStatus } from '../types'

export type PlanStatusFilter = PlanStatus | 'ALL'

interface TabConfig {
  value: PlanStatusFilter
  label: string
  bulkAction: 'confirm' | 'release' | null
}

export const PLAN_STATUS_TABS: TabConfig[] = [
  { value: 'ALL', label: '전체', bulkAction: null },
  { value: PlanStatus.DRAFT, label: '초안', bulkAction: 'confirm' },
  { value: PlanStatus.CONFIRMED, label: '확정', bulkAction: 'release' },
  { value: PlanStatus.RELEASED, label: '발행', bulkAction: null },
  { value: PlanStatus.CLOSED, label: '완료', bulkAction: null },
]

interface PlanStatusTabsProps {
  activeTab: PlanStatusFilter
  counts: Partial<Record<PlanStatusFilter, number>>
  onChange: (tab: PlanStatusFilter) => void
}

const PlanStatusTabs = ({ activeTab, counts, onChange }: PlanStatusTabsProps) => {
  return (
    <div className="flex gap-1 border-b border-[var(--border)]">
      {PLAN_STATUS_TABS.map((tab) => {
        const isActive = activeTab === tab.value
        const count = counts[tab.value]
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={[
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors',
              'border-b-2 -mb-px',
              isActive
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-base)]',
            ].join(' ')}
          >
            {tab.label}
            {count !== undefined && (
              <span
                className={[
                  'rounded-full px-1.5 py-0.5 text-xs font-medium',
                  isActive
                    ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                    : 'bg-[var(--surface-alt)] text-[var(--text-muted)]',
                ].join(' ')}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default PlanStatusTabs
