import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const PrivateRoute = () => {
  const { session, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--text-muted)]">
        Loading...
      </div>
    )
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoute
