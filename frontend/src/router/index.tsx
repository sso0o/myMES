import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/features/auth/pages/LoginPage'
import PrivateRoute from './PrivateRoute'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <PrivateRoute />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <div className="p-8 text-slate-700">Dashboard (준비 중)</div> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default router
