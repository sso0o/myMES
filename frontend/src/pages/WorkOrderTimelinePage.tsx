import { useMemo } from 'react'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { useEquipmentList } from '@/features/prod-basic/equipment/hooks/useEquipmentQuery'
import { useProcessList } from '@/features/prod-basic/process/hooks/useProcessQuery'
import EquipmentTimeline from '@/features/prod-management/work-order/components/EquipmentTimeline'
import WorkOrderAssignmentRow from '@/features/prod-management/work-order/components/WorkOrderAssignmentRow'
import {
  useUpdateWorkOrder,
  useWorkOrderList,
} from '@/features/prod-management/work-order/hooks/useWorkOrderQuery'
import { WorkOrderStatus, type WorkOrderResponse } from '@/features/prod-management/work-order/types'

const statusLabel: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.WAITING]: '대기',
  [WorkOrderStatus.IN_PROGRESS]: '진행',
  [WorkOrderStatus.COMPLETED]: '완료',
}

const WorkOrderTimelinePage = () => {
  const { showToast } = useFeedback()
  const { data: workOrders = [], isLoading: workOrdersLoading, isError: workOrdersError } = useWorkOrderList()
  const { data: equipments = [], isLoading: equipmentsLoading, isError: equipmentsError } = useEquipmentList()
  const { data: processes = [], isLoading: processesLoading, isError: processesError } = useProcessList()
  const updateWorkOrder = useUpdateWorkOrder()

  const waitingOrders = useMemo(
    () => workOrders.filter((workOrder) => workOrder.status === WorkOrderStatus.WAITING),
    [workOrders],
  )
  const assignedCount = useMemo(
    () => workOrders.filter((workOrder) => workOrder.equipmentId !== null).length,
    [workOrders],
  )

  const handleSaveAssignment = (
    workOrder: WorkOrderResponse,
    processId: number | null,
    equipmentId: number | null,
  ) => {
    updateWorkOrder.mutate(
      {
        id: workOrder.id,
        data: {
          itemId: workOrder.itemId,
          plannedQty: workOrder.plannedQty,
          priority: workOrder.priority,
          processId: processId ?? undefined,
          equipmentId: equipmentId ?? undefined,
          workerName: workOrder.workerName ?? undefined,
          dueDate: workOrder.dueDate,
        },
      },
      {
        onSuccess: () => showToast({ title: '설비 배정을 저장했습니다.', variant: 'success' }),
        onError: () => showToast({ title: '설비 배정 저장 중 오류가 발생했습니다.', variant: 'error' }),
      },
    )
  }

  const isLoading = workOrdersLoading || equipmentsLoading || processesLoading
  const isError = workOrdersError || equipmentsError || processesError

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="작업 지시"
        description="설비별 작업지시 배정 현황을 날짜 기준 타임라인으로 확인합니다."
      />

      {isError && <InlineAlert>작업지시 타임라인 정보를 불러오는 중 오류가 발생했습니다.</InlineAlert>}

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
          <div className="mt-1 text-2xl font-semibold text-[var(--text-strong)]">{waitingOrders.length}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--text-muted)]">
          타임라인을 불러오는 중입니다.
        </div>
      ) : (
        <EquipmentTimeline equipments={equipments} workOrders={workOrders} />
      )}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-base font-semibold text-[var(--text-strong)]">설비 배정</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            대기 상태 작업지시는 공정별 등록 설비 안에서 배정할 수 있습니다.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-alt)] text-xs font-semibold text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">작업지시</th>
                <th className="px-4 py-3">납기일</th>
                <th className="px-4 py-3">공정</th>
                <th className="px-4 py-3">설비</th>
                <th className="px-4 py-3 text-right">저장</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                    등록된 작업지시가 없습니다.
                  </td>
                </tr>
              ) : (
                workOrders.map((workOrder) => (
                  <WorkOrderAssignmentRow
                    key={workOrder.id}
                    workOrder={workOrder}
                    processes={processes}
                    isSaving={updateWorkOrder.isPending}
                    onSave={handleSaveAssignment}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--text-muted)]">
          진행/완료 상태는 기존 작업지시 상태 규칙에 따라 수정할 수 없습니다. 상태 표시는{' '}
          {Object.values(WorkOrderStatus).map((status) => `${statusLabel[status]}(${status})`).join(', ')}
          입니다.
        </div>
      </section>
    </div>
  )
}

export default WorkOrderTimelinePage
