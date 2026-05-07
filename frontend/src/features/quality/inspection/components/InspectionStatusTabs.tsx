import { QualityInspectionStatus } from '../types'

export type InspectionStatusFilter = QualityInspectionStatus | 'ALL'

interface TabConfig {
  value: InspectionStatusFilter
  label: string
}

export const INSPECTION_STATUS_TABS: TabConfig[] = [
  { value: 'ALL', label: '전체' },
  { value: QualityInspectionStatus.WAITING, label: '대기' },
  { value: QualityInspectionStatus.IN_PROGRESS, label: '검사중' },
  { value: QualityInspectionStatus.COMPLETED, label: '완료' },
]

interface InspectionStatusTabsProps {
  activeTab: InspectionStatusFilter
  counts: Partial<Record<InspectionStatusFilter, number>>
  onChange: (tab: InspectionStatusFilter) => void
}

const InspectionStatusTabs = ({ activeTab, counts, onChange }: InspectionStatusTabsProps) => {
  return (
    <div className="flex gap-1 border-b border-[var(--border)]">
      {INSPECTION_STATUS_TABS.map((tab) => {
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

export default InspectionStatusTabs
