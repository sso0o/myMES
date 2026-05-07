import type { EquipmentResponse } from '@/features/prod-basic/equipment/types'
import type { WorkOrderResponse } from '../types'
import { WorkOrderStatus } from '../types'

interface EquipmentTimelineProps {
  equipments: EquipmentResponse[]
  workOrders: WorkOrderResponse[]
  onStartWorkOrder?: (workOrder: WorkOrderResponse) => void
}

const statusClass: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.WAITING]: 'border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)]',
  [WorkOrderStatus.IN_PROGRESS]: 'border-[var(--success)]/25 bg-[var(--success-soft)] text-[var(--success)]',
  [WorkOrderStatus.COMPLETED]: 'border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text-muted)]',
}

const statusLabel: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.WAITING]: '대기',
  [WorkOrderStatus.IN_PROGRESS]: '진행',
  [WorkOrderStatus.COMPLETED]: '완료',
}

const toDate = (value: string) => new Date(`${value}T00:00:00`)

const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const buildDateRange = (workOrders: WorkOrderResponse[]) => {
  if (workOrders.length === 0) {
    const today = new Date()
    return Array.from({ length: 7 }, (_, index) => addDays(today, index))
  }

  const dates = workOrders.map((workOrder) => toDate(workOrder.dueDate))
  const minDate = new Date(Math.min(...dates.map((date) => date.getTime())))
  const maxDate = new Date(Math.max(...dates.map((date) => date.getTime())))
  const start = addDays(minDate, -2)
  const end = addDays(maxDate, 4)
  const result: Date[] = []
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    result.push(cursor)
  }
  return result
}

const EquipmentTimeline = ({ equipments, workOrders, onStartWorkOrder }: EquipmentTimelineProps) => {
  const dates = buildDateRange(workOrders)
  const assignedEquipmentIds = new Set(workOrders.map((workOrder) => workOrder.equipmentId).filter(Boolean))
  const timelineRows = equipments
    .filter((equipment) => equipment.isActive || assignedEquipmentIds.has(equipment.id))
    .map((equipment) => ({
      id: equipment.id,
      code: equipment.equipmentCode,
      name: equipment.equipmentName,
      workOrders: workOrders.filter((workOrder) => workOrder.equipmentId === equipment.id),
    }))

  const unassigned = workOrders.filter((workOrder) => workOrder.equipmentId === null)
  const rows = [
    ...timelineRows,
    { id: 0, code: '미배정', name: '설비 미배정', workOrders: unassigned },
  ]

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-alt)]">
            <th className="sticky left-0 z-[1] w-48 min-w-48 bg-[var(--surface-alt)] px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)]">
              설비
            </th>
            {dates.map((date) => (
              <th
                key={toDateKey(date)}
                className="min-w-36 border-l border-[var(--border)] px-3 py-3 text-left text-xs font-semibold text-[var(--text-muted)]"
              >
                <div>{toDateKey(date).slice(5)}</div>
                <div className="font-normal">
                  {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
              <th className="sticky left-0 z-[1] w-48 min-w-48 bg-[var(--surface)] px-4 py-4 text-left align-top">
                <div className="text-sm font-semibold text-[var(--text-strong)]">{row.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{row.code}</div>
              </th>
              {dates.map((date) => {
                const dateKey = toDateKey(date)
                const dayOrders = row.workOrders.filter((workOrder) => workOrder.dueDate === dateKey)
                return (
                  <td
                    key={`${row.id}-${dateKey}`}
                    className="min-w-36 border-l border-[var(--border)] px-2 py-3 align-top"
                  >
                    <div className="flex min-h-16 flex-col gap-2">
                      {dayOrders.map((workOrder) => {
                        const isWaiting = workOrder.status === WorkOrderStatus.WAITING
                        return (
                          <div
                            key={workOrder.id}
                            className={`rounded-md border px-2 py-1.5 ${statusClass[workOrder.status]} ${isWaiting ? 'cursor-pointer hover:brightness-95' : ''}`}
                            title={isWaiting ? '클릭하여 작업 시작' : workOrder.workOrderNo}
                            onClick={() => isWaiting && onStartWorkOrder?.(workOrder)}
                          >
                            <div className="truncate text-xs font-semibold">{workOrder.workOrderNo}</div>
                            <div className="truncate text-[11px]">{workOrder.itemName}</div>
                            <div className="mt-1 text-[10px]">{statusLabel[workOrder.status]}</div>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EquipmentTimeline
