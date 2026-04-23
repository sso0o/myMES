import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/store/authStore'
import { useFeedback } from '@/common/hooks/useFeedback'

const MainLayout = () => {
  const { user, signOut } = useAuthStore()
  const { showAlert } = useFeedback()

  const displayName =
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    '사용자'

  const handleSignOut = async () => {
    await showAlert({
      title: '로그아웃',
      message: '로그아웃 하시겠습니까?',
      confirmText: '로그아웃',
    })
    await signOut()
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="ml-60 flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-4 border-b border-slate-200 bg-white px-6">
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{displayName}</span>님 반갑습니다!
          </span>
          <button
            onClick={handleSignOut}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            로그아웃
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
