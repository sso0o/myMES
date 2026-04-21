import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const PrivateRoute = () => {
  const { session, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading...
      </div>
    )
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoute
