import {
  BarChart2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  ListTree,
  Package,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const menuGroups = [
  {
    items: [{ label: '대시보드', path: '/dashboard', icon: LayoutDashboard }],
  },
  {
    group: '기준 관리',
    items: [
      { label: '공통코드 관리', path: '/master/common-codes', icon: ListTree },
      { label: '품목 관리', path: '/master/items', icon: Package },
      { label: '설비 관리', path: '/equipment', icon: Wrench },
    ],
  },
  {
    group: '생산 관리',
    items: [
      { label: '작업 지시', path: '/work-orders', icon: ClipboardList },
      { label: '생산 실적', path: '/production', icon: BarChart2 },
      { label: '생산 계획', path: '/planning', icon: CalendarDays },
      { label: '품질 관리', path: '/quality', icon: ShieldCheck },
    ],
  },
]

const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-[var(--sidebar-bg)]">
      <div className="flex h-14 items-center gap-2 border-b border-[var(--sidebar-border)] px-6">
        <span className="text-lg font-bold tracking-wide text-[var(--text-inverse)]">
          MES
        </span>
        <span className="text-xs text-[var(--sidebar-text)]">생산 실행 시스템</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {menuGroups.map(({ group, items }, groupIdx) => (
          <div key={groupIdx}>
            {group && (
              <p className="mb-1 mt-4 px-6 text-[10px] font-semibold uppercase tracking-widest text-[var(--sidebar-text)]">
                {group}
              </p>
            )}
            {items.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--sidebar-item-active)] text-[var(--sidebar-text-active)]'
                      : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-item-hover)] hover:text-[var(--sidebar-text-active)]'
                  }`
                }
              >
                <Icon size={17} strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
