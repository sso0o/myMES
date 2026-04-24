import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import PrivateRoute from './PrivateRoute'
import MainLayout from '@/common/components/layout/MainLayout'
import ItemManagementPage from '@/pages/ItemManagementPage'
import CommonCodeManagementPage from '@/pages/CommonCodeManagementPage'
import ProcessManagementPage from '@/pages/ProcessManagementPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <div className="text-slate-700">대시보드 (준비 중)</div> },
          { path: '/work-orders', element: <div className="text-slate-700">작업 지시 (준비 중)</div> },
          { path: '/production', element: <div className="text-slate-700">생산 실적 (준비 중)</div> },
          { path: '/planning', element: <div className="text-slate-700">생산 계획 (준비 중)</div> },
          { path: '/quality', element: <div className="text-slate-700">품질 관리 (준비 중)</div> },
          { path: '/equipment', element: <div className="text-slate-700">설비 관리 (준비 중)</div> },
          { path: '/master/items', element: <ItemManagementPage /> },
          { path: '/master/common-codes', element: <CommonCodeManagementPage /> },
          { path: '/master/processes', element: <ProcessManagementPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default router
