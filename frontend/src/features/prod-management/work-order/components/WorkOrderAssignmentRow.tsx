import { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { useProcessEquipmentListByProcess } from '@/features/prod-basic/process-equipment/hooks/useProcessEquipmentQuery'
import type { ProcessResponse } from '@/features/prod-basic/process/types'
import { saveIconButtonClass } from '@/common/styles/button'
import type { WorkOrderResponse } from '../types'
import { WorkOrderStatus } from '../types'

interface WorkOrderAssignmentRowProps {
  workOrder: WorkOrderResponse
  processes: ProcessResponse[]
  isSaving: boolean
  onSave: (workOrder: WorkOrderResponse, processId: number | null, equipmentId: number | null) => void
}

const selectClass =
  'h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text-base)] outline-none transition-colors focus:border-[var(--primary)] disabled:bg-[var(--surface-alt)] disabled:text-[var(--text-muted)]'

const WorkOrderAssignmentRow = ({
  workOrder,
  processes,
  isSaving,
  onSave,
}: WorkOrderAssignmentRowProps) => {
  const [processId, setProcessId] = useState<number | null>(workOrder.processId)
  const [equipmentId, setEquipmentId] = useState<number | null>(workOrder.equipmentId)
  const { data: processEquipments = [] } = useProcessEquipmentListByProcess(processId)

  useEffect(() => {
    setProcessId(workOrder.processId)
    setEquipmentId(workOrder.equipmentId)
  }, [workOrder.equipmentId, workOrder.processId])

  const equipmentOptions = useMemo(
    () =>
      processEquipments.map((item) => ({
        id: item.equipmentId,
        label: `${item.equipmentCode} · ${item.equipmentName}${item.isPrimary ? ' · 주 설비' : ''}`,
      })),
    [processEquipments],
  )

  const canEdit = workOrder.status === WorkOrderStatus.WAITING
  const isDirty = processId !== workOrder.processId || equipmentId !== workOrder.equipmentId

  const handleProcessChange = (value: string) => {
    const nextProcessId = value ? Number(value) : null
    setProcessId(nextProcessId)
    setEquipmentId(null)
  }

  return (
    <tr className="border-b border-[var(--border)] last:border-0">
      <td className="px-4 py-3">
        <div className="font-medium text-[var(--text-strong)]">{workOrder.workOrderNo}</div>
        <div className="text-xs text-[var(--text-muted)]">{workOrder.itemName}</div>
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-base)]">{workOrder.dueDate}</td>
      <td className="px-4 py-3">
        <select
          value={processId ?? ''}
          onChange={(event) => handleProcessChange(event.target.value)}
          disabled={!canEdit || isSaving}
          className={`${selectClass} w-44`}
        >
          <option value="">공정 선택</option>
          {processes.map((process) => (
            <option key={process.id} value={process.id}>
              {process.processCode} · {process.processName}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          value={equipmentId ?? ''}
          onChange={(event) => setEquipmentId(event.target.value ? Number(event.target.value) : null)}
          disabled={!canEdit || isSaving || processId === null}
          className={`${selectClass} w-52`}
        >
          <option value="">설비 미배정</option>
          {equipmentOptions.map((equipment) => (
            <option key={equipment.id} value={equipment.id}>
              {equipment.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onSave(workOrder, processId, equipmentId)}
          disabled={!canEdit || !isDirty || isSaving}
          className={saveIconButtonClass}
          title="배정 저장"
        >
          <Save size={17} />
        </button>
      </td>
    </tr>
  )
}

export default WorkOrderAssignmentRow
