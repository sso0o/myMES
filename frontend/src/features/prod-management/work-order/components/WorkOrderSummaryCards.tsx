import { useMemo } from 'react'
import { useWorkOrderList } from '@/features/prod-management/work-order/hooks/useWorkOrderQuery'
import { WorkOrderStatus } from '@/features/prod-management/work-order/types'

const WorkOrderSummaryCards = () => {
  const { data: workOrders = [] } = useWorkOrderList()
  const waitingCount = useMemo(
    () => workOrders.filter((workOrder) => workOrder.status === WorkOrderStatus.WAITING).length,
    [workOrders],
  )
  const assignedCount = useMemo(
    () => workOrders.filter((workOrder) => workOrder.equipmentId !== null).length,
    [workOrders],
  )

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="text-xs font-medium text-[var(--text-muted)]">전체 작업지시</div>
        <div className="mt-1 text-2xl font-semibold text-[var(--text-strong)]">{workOrders.length}</div>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="text-xs font-medium text-[var(--text-muted)]">설비 배정</div>
        <div className="mt-1 text-2xl font-semibold text-[var(--text-strong)]">{assignedCount}</div>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="text-xs font-medium text-[var(--text-muted)]">대기 상태</div>
        <div className="mt-1 text-2xl font-semibold text-[var(--text-strong)]">{waitingCount}</div>
      </div>
    </div>
  )
}

export default WorkOrderSummaryCards
