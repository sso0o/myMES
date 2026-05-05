import Badge from '@/common/components/Badge'
import { WorkerStatus, type WorkerStatus as WorkerStatusType } from '../types'

const statusLabel: Record<WorkerStatusType, string> = {
  [WorkerStatus.ACTIVE]: '재직',
  [WorkerStatus.ON_LEAVE]: '휴직',
  [WorkerStatus.RESIGNED]: '퇴사',
}

const statusVariant: Record<WorkerStatusType, 'success' | 'primary' | 'muted'> = {
  [WorkerStatus.ACTIVE]: 'success',
  [WorkerStatus.ON_LEAVE]: 'primary',
  [WorkerStatus.RESIGNED]: 'muted',
}

interface WorkerStatusBadgeProps {
  status: WorkerStatusType
}

const WorkerStatusBadge = ({ status }: WorkerStatusBadgeProps) => (
  <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
)

export default WorkerStatusBadge
