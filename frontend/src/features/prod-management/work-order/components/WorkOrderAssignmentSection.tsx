import { useState } from 'react'
import { useFeedback } from '@/common/hooks/useFeedback'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useProcessList } from '@/features/prod-basic/process/hooks/useProcessQuery'
import WorkOrderAssignmentDataGrid, {
  type WorkOrderAssignmentDraft,
} from '@/features/prod-management/work-order/components/WorkOrderAssignmentDataGrid'
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

const WorkOrderAssignmentSection = () => {
  const { showToast } = useFeedback()
  const { data: workOrders = [], isLoading: workOrdersLoading } = useWorkOrderList()
  const { data: processes = [], isLoading: processesLoading } = useProcessList()
  const updateWorkOrder = useUpdateWorkOrder()
  const [drafts, setDrafts] = useState<Record<number, WorkOrderAssignmentDraft>>({})

  const handleChangeProcess = (workOrder: WorkOrderResponse, processId: number | null) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [workOrder.id]: {
        processId,
        equipmentId: null,
      },
    }))
  }

  const handleChangeEquipment = (workOrder: WorkOrderResponse, equipmentId: number | null) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [workOrder.id]: {
        processId: currentDrafts[workOrder.id]?.processId ?? workOrder.processId,
        equipmentId,
      },
    }))
  }

  const handleSaveAssignment = (workOrder: WorkOrderResponse) => {
    const draft = drafts[workOrder.id] ?? {
      processId: workOrder.processId,
      equipmentId: workOrder.equipmentId,
    }

    updateWorkOrder.mutate(
      {
        id: workOrder.id,
        data: {
          itemId: workOrder.itemId,
          plannedQty: workOrder.plannedQty,
          priority: workOrder.priority,
          processId: draft.processId ?? undefined,
          equipmentId: draft.equipmentId ?? undefined,
          workerName: workOrder.workerName ?? undefined,
          productionDate: workOrder.productionDate,
          dueDate: workOrder.dueDate,
        },
      },
      {
        onSuccess: () => {
          setDrafts((currentDrafts) => ({
            ...currentDrafts,
            [workOrder.id]: draft,
          }))
          showToast({ title: '설비 배정을 저장했습니다.', variant: 'success' })
        },
        onError: (error) =>
          showToast({
            title: getApiErrorMessage(error, '처리 중 오류가 발생했습니다.'),
            variant: 'error',
          }),
      },
    )
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-base font-semibold text-[var(--text-strong)]">설비 배정</h2>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          대기 상태 작업지시는 공정별 등록 설비 안에서 배정할 수 있습니다.
        </p>
      </div>
      <div className="h-[460px]">
        <WorkOrderAssignmentDataGrid
          workOrders={workOrders}
          processes={processes}
          drafts={drafts}
          loading={workOrdersLoading || processesLoading}
          isSaving={updateWorkOrder.isPending}
          onChangeProcess={handleChangeProcess}
          onChangeEquipment={handleChangeEquipment}
          onSave={handleSaveAssignment}
        />
      </div>
      <div className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--text-muted)]">
        진행/완료 상태는 기존 작업지시 상태 규칙에 따라 수정할 수 없습니다. 상태 표시는{' '}
        {Object.values(WorkOrderStatus).map((status) => `${statusLabel[status]}(${status})`).join(', ')}
        입니다.
      </div>
    </section>
  )
}

export default WorkOrderAssignmentSection
