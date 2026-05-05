import PageHeader from '@/common/components/PageHeader'
import WorkOrderAssignmentSection from '@/features/prod-management/work-order/components/WorkOrderAssignmentSection'
import WorkOrderSummaryCards from '@/features/prod-management/work-order/components/WorkOrderSummaryCards'
import WorkOrderTimelineSection from '@/features/prod-management/work-order/components/WorkOrderTimelineSection'

const WorkOrderTimelinePage = () => {
  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="작업 지시"
        description="설비별 작업지시 배정 현황을 날짜 기준 타임라인으로 확인합니다."
      />
      <WorkOrderSummaryCards />
      <WorkOrderTimelineSection />
      <WorkOrderAssignmentSection />
    </div>
  )
}

export default WorkOrderTimelinePage
