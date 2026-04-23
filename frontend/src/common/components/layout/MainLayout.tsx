import { Outlet } from 'react-router-dom'
import { useFeedback } from '@/common/hooks/useFeedback'
import { useAuthStore } from '@/store/authStore'
import Sidebar from './Sidebar'

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
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />

      <div className="ml-60 flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6">
          <span className="text-sm text-[var(--text-base)]">
            <span className="font-semibold text-[var(--text-strong)]">{displayName}</span>
            님 반갑습니다!
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-base)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-alt)]"
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
