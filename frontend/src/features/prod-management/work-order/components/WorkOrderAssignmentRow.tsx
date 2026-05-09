import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
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

const WorkOrderAssignmentRow = ({
  workOrder,
  processes,
  isSaving,
  onSave,
}: WorkOrderAssignmentRowProps) => {
  const [processId, setProcessId] = useState<number | null>(workOrder.processId)
  const [equipmentId, setEquipmentId] = useState<number | null>(workOrder.equipmentId)
  const [serverAssignment, setServerAssignment] = useState({
    processId: workOrder.processId,
    equipmentId: workOrder.equipmentId,
  })
  const { data: processEquipments = [] } = useProcessEquipmentListByProcess(processId)

  if (
    serverAssignment.processId !== workOrder.processId ||
    serverAssignment.equipmentId !== workOrder.equipmentId
  ) {
    setServerAssignment({
      processId: workOrder.processId,
      equipmentId: workOrder.equipmentId,
    })
    setProcessId(workOrder.processId)
    setEquipmentId(workOrder.equipmentId)
  }

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
      <td className="px-4 py-3 text-sm text-[var(--text-base)]">{workOrder.dueDate ?? '-'}</td>
      <td className="px-4 py-3">
        <AppSelect
          value={processId === null ? '' : String(processId)}
          onChange={(event) => handleProcessChange(event.target.value)}
          disabled={!canEdit || isSaving}
          sx={{ width: 176 }}
        >
          <AppMenuItem value="">공정 선택</AppMenuItem>
          {processes.map((process) => (
            <AppMenuItem key={process.id} value={String(process.id)}>
              {process.processCode} · {process.processName}
            </AppMenuItem>
          ))}
        </AppSelect>
      </td>
      <td className="px-4 py-3">
        <AppSelect
          value={equipmentId === null ? '' : String(equipmentId)}
          onChange={(event) => setEquipmentId(event.target.value ? Number(event.target.value) : null)}
          disabled={!canEdit || isSaving || processId === null}
          sx={{ width: 208 }}
        >
          <AppMenuItem value="">설비 미배정</AppMenuItem>
          {equipmentOptions.map((equipment) => (
            <AppMenuItem key={equipment.id} value={String(equipment.id)}>
              {equipment.label}
            </AppMenuItem>
          ))}
        </AppSelect>
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
