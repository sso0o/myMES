import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import PrivateRoute from './PrivateRoute'
import MainLayout from '@/common/components/layout/MainLayout'
import RouteErrorScreen from '@/common/components/error/RouteErrorScreen'
import ItemManagementPage from '@/pages/ItemManagementPage'
import CommonCodeManagementPage from '@/pages/CommonCodeManagementPage'
import ProcessManagementPage from '@/pages/ProcessManagementPage'
import EquipmentManagementPage from '@/pages/EquipmentManagementPage'
import ItemProcessManagementPage from '@/pages/ItemProcessManagementPage'
import BomManagementPage from '@/pages/BomManagementPage'
import PlanningManagementPage from '@/pages/PlanningManagementPage'
import ProcessEquipmentManagementPage from '@/pages/ProcessEquipmentManagementPage'
import WorkOrderTimelinePage from '@/pages/WorkOrderTimelinePage'
import DashboardPage from '@/pages/DashboardPage'
import ProductionRecordPage from '@/pages/ProductionRecordPage'
import WorkerManagementPage from '@/pages/WorkerManagementPage'
import QualityInspectionPage from '@/pages/QualityInspectionPage'
import DefectManagementPage from '@/pages/DefectManagementPage'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorScreen /> },
  {
    element: <PrivateRoute />,
    errorElement: <RouteErrorScreen />,
    children: [
      {
        element: <MainLayout />,
        errorElement: <RouteErrorScreen />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/work-orders', element: <WorkOrderTimelinePage /> },
          { path: '/production', element: <ProductionRecordPage /> },
          { path: '/planning', element: <PlanningManagementPage /> },
          { path: '/quality', element: <Navigate to="/quality/inspections" replace /> },
          { path: '/quality/inspections', element: <QualityInspectionPage /> },
          { path: '/quality/defects', element: <DefectManagementPage /> },
          { path: '/master/items', element: <ItemManagementPage /> },
          { path: '/master/common-codes', element: <CommonCodeManagementPage /> },
          { path: '/prod-basic/processes', element: <ProcessManagementPage /> },
          { path: '/prod-basic/equipment', element: <EquipmentManagementPage /> },
          { path: '/prod-basic/item-processes', element: <ItemProcessManagementPage /> },
          { path: '/prod-basic/boms', element: <BomManagementPage /> },
          { path: '/prod-basic/process-equipment', element: <ProcessEquipmentManagementPage /> },
          { path: '/operation/workers', element: <WorkerManagementPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace />, errorElement: <RouteErrorScreen /> },
])

export default router
