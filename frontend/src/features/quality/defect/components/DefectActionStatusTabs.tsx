import { DefectAction } from '../types'

export type DefectActionFilter = DefectAction | 'ALL'

interface TabConfig {
  value: DefectActionFilter
  label: string
}

const DEFECT_ACTION_TABS: TabConfig[] = [
  { value: 'ALL', label: '전체' },
  { value: DefectAction.WAITING, label: '대기' },
  { value: DefectAction.REWORK, label: '재작업' },
  { value: DefectAction.SCRAP, label: '폐기' },
  { value: DefectAction.COMPLETED, label: '완료' },
]

interface DefectActionStatusTabsProps {
  activeTab: DefectActionFilter
  counts: Partial<Record<DefectActionFilter, number>>
  onChange: (tab: DefectActionFilter) => void
}

const DefectActionStatusTabs = ({ activeTab, counts, onChange }: DefectActionStatusTabsProps) => {
  return (
    <div className="flex gap-1 border-b border-[var(--border)]">
      {DEFECT_ACTION_TABS.map((tab) => {
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

export default DefectActionStatusTabs
