import InlineAlert from '@/common/components/InlineAlert'
import { useEquipmentList } from '@/features/prod-basic/equipment/hooks/useEquipmentQuery'
import EquipmentTimeline from '@/features/prod-management/work-order/components/EquipmentTimeline'
import { useWorkOrderList } from '@/features/prod-management/work-order/hooks/useWorkOrderQuery'

const WorkOrderTimelineSection = () => {
  const { data: workOrders = [], isLoading: workOrdersLoading, isError: workOrdersError } = useWorkOrderList()
  const { data: equipments = [], isLoading: equipmentsLoading, isError: equipmentsError } = useEquipmentList()
  const isLoading = workOrdersLoading || equipmentsLoading

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

  return <EquipmentTimeline equipments={equipments} workOrders={workOrders} />
}

export default WorkOrderTimelineSection
