import InlineAlert from '@/common/components/InlineAlert'
import { useFeedback } from '@/common/hooks/useFeedback'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useEquipmentList } from '@/features/prod-basic/equipment/hooks/useEquipmentQuery'
import EquipmentTimeline from '@/features/prod-management/work-order/components/EquipmentTimeline'
import {
  useChangeWorkOrderStatus,
  useWorkOrderList,
} from '@/features/prod-management/work-order/hooks/useWorkOrderQuery'
import { WorkOrderStatus, type WorkOrderResponse } from '@/features/prod-management/work-order/types'

const WorkOrderTimelineSection = () => {
  const { data: workOrders = [], isLoading: workOrdersLoading, isError: workOrdersError } = useWorkOrderList()
  const { data: equipments = [], isLoading: equipmentsLoading, isError: equipmentsError } = useEquipmentList()
  const isLoading = workOrdersLoading || equipmentsLoading
  const { showAlert, showToast } = useFeedback()
  const changeStatus = useChangeWorkOrderStatus()

  const handleStartWorkOrder = async (workOrder: WorkOrderResponse) => {
    const confirmed = await showAlert({
      title: '작업 시작',
      message: `[${workOrder.workOrderNo}] ${workOrder.itemName}\n작업을 시작하시겠습니까?`,
      confirmText: '시작',
    })
    if (!confirmed) return

    changeStatus.mutate(
      { id: workOrder.id, status: WorkOrderStatus.IN_PROGRESS },
      {
        onSuccess: () => showToast({ title: '작업이 시작되었습니다.', variant: 'success' }),
        onError: (error) =>
          showToast({
            title: getApiErrorMessage(error, '작업 시작 중 오류가 발생했습니다.'),
            variant: 'error',
          }),
      },
    )
  }

  if (workOrdersError || equipmentsError) {
    return <InlineAlert>작업지시 타임라인 정보를 불러오는 중 오류가 발생했습니다.</InlineAlert>
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--text-muted)]">
        타임라인을 불러오는 중입니다.
      </div>
    )
  }

  return (
    <EquipmentTimeline
      equipments={equipments}
      workOrders={workOrders}
      onStartWorkOrder={handleStartWorkOrder}
    />
  )
}

export default WorkOrderTimelineSection
