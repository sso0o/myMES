import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  CalendarDays,
  ShieldCheck,
  Wrench,
} from 'lucide-react'

const menus = [
  { label: '대시보드', path: '/dashboard', icon: LayoutDashboard },
  { label: '작업 지시', path: '/work-orders', icon: ClipboardList },
  { label: '생산 실적', path: '/production', icon: BarChart2 },
  { label: '생산 계획', path: '/planning', icon: CalendarDays },
  { label: '품질 관리', path: '/quality', icon: ShieldCheck },
  { label: '설비 관리', path: '/equipment', icon: Wrench },
]

const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-slate-900">
      <div className="flex h-14 items-center gap-2 border-b border-slate-700 px-6">
        <span className="text-lg font-bold tracking-wide text-white">MES</span>
        <span className="text-xs text-slate-400">생산 실행 시스템</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {menus.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={17} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
