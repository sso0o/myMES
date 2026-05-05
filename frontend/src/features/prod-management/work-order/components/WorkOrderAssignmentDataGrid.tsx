import { useState } from 'react'
import { Save } from 'lucide-react'
import type { SelectChangeEvent } from '@mui/material/Select'
import type { GridColDef } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import { saveIconButtonClass } from '@/common/styles/button'
import { useProcessEquipmentListByProcess } from '@/features/prod-basic/process-equipment/hooks/useProcessEquipmentQuery'
import type { ProcessResponse } from '@/features/prod-basic/process/types'
import { WorkOrderStatus, type WorkOrderResponse } from '../types'

const DATA_GRID_DEFAULT_PAGE_SIZE = 10
const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center'

export interface WorkOrderAssignmentDraft {
  processId: number | null
  equipmentId: number | null
}

interface WorkOrderAssignmentDataGridProps {
  workOrders: WorkOrderResponse[]
  processes: ProcessResponse[]
  drafts: Record<number, WorkOrderAssignmentDraft>
  loading: boolean
  isSaving: boolean
  onChangeProcess: (workOrder: WorkOrderResponse, processId: number | null) => void
  onChangeEquipment: (workOrder: WorkOrderResponse, equipmentId: number | null) => void
  onSave: (workOrder: WorkOrderResponse) => void
}

interface AssignmentSelectProps {
  disabled: boolean
  value: number | null
  onChange: (value: number | null) => void
}

interface ProcessSelectCellProps extends AssignmentSelectProps {
  processes: ProcessResponse[]
}

interface EquipmentSelectCellProps extends AssignmentSelectProps {
  processId: number | null
}

const getDraft = (
  drafts: Record<number, WorkOrderAssignmentDraft>,
  workOrder: WorkOrderResponse,
): WorkOrderAssignmentDraft => drafts[workOrder.id] ?? {
  processId: workOrder.processId,
  equipmentId: workOrder.equipmentId,
}

const canEditWorkOrder = (workOrder: WorkOrderResponse) =>
  workOrder.status === WorkOrderStatus.WAITING

const formatProcess = (workOrder: WorkOrderResponse) => {
  if (!workOrder.processCode && !workOrder.processName) {
    return '-'
  }

  return `${workOrder.processCode ?? '-'} - ${workOrder.processName ?? '-'}`
}

const formatEquipment = (workOrder: WorkOrderResponse) => {
  if (!workOrder.equipmentCode && !workOrder.equipmentName) {
    return '설비 미배정'
  }

  return `${workOrder.equipmentCode ?? '-'} - ${workOrder.equipmentName ?? '-'}`
}

const ProcessSelectCell = ({
  processes,
  disabled,
  value,
  onChange,
}: ProcessSelectCellProps) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value ? Number(event.target.value) : null)
  }

  return (
  <AppSelect
    value={value === null ? '' : String(value)}
    onChange={handleChange}
    onClick={(event) => event.stopPropagation()}
    onMouseDown={(event) => event.stopPropagation()}
    disabled={disabled}
    renderValue={(selected) => {
      if (!selected) return <span className="text-[var(--text-muted)]">공정 선택</span>

      const process = processes.find((item) => item.id === Number(selected))
      return process ? `${process.processCode} - ${process.processName}` : '공정 선택'
    }}
  >
    <AppMenuItem value="">공정 선택</AppMenuItem>
    {processes.map((process) => (
      <AppMenuItem key={process.id} value={String(process.id)}>
        {process.processCode} - {process.processName}
      </AppMenuItem>
    ))}
  </AppSelect>
  )
}

const EquipmentSelectCell = ({
  processId,
  disabled,
  value,
  onChange,
}: EquipmentSelectCellProps) => {
  const { data: processEquipments = [], isLoading } = useProcessEquipmentListByProcess(processId)
  const isDisabled = disabled || processId === null || isLoading
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value ? Number(event.target.value) : null)
  }

  return (
    <AppSelect
      value={value === null ? '' : String(value)}
      onChange={handleChange}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      disabled={isDisabled}
      renderValue={(selected) => {
        if (!selected) {
          return (
            <span className="text-[var(--text-muted)]">
              {isLoading ? '설비 불러오는 중' : '설비 미배정'}
            </span>
          )
        }

        const equipment = processEquipments.find((item) => item.equipmentId === Number(selected))
        if (!equipment) return '설비 미배정'

        return `${equipment.equipmentCode} - ${equipment.equipmentName}${
          equipment.isPrimary ? ' - 주 설비' : ''
        }`
      }}
    >
      <AppMenuItem value="">{isLoading ? '설비 불러오는 중' : '설비 미배정'}</AppMenuItem>
      {processEquipments.map((equipment) => (
        <AppMenuItem key={equipment.equipmentId} value={String(equipment.equipmentId)}>
          {equipment.equipmentCode} - {equipment.equipmentName}
          {equipment.isPrimary ? ' - 주 설비' : ''}
        </AppMenuItem>
      ))}
    </AppSelect>
  )
}

const WorkOrderAssignmentDataGrid = ({
  workOrders,
  processes,
  drafts,
  loading,
  isSaving,
  onChangeProcess,
  onChangeEquipment,
  onSave,
}: WorkOrderAssignmentDataGridProps) => {
  const [editingId, setEditingId] = useState<number | null>(null)

  const columns: GridColDef<WorkOrderResponse>[] = [
    {
      field: 'workOrderNo',
      headerName: '작업지시번호',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate font-mono text-[var(--text-strong)]">
          {params.row.workOrderNo}
        </span>
      ),
    },
    {
      field: 'itemName',
      headerName: '품목명',
      minWidth: 180,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-strong)]">{params.row.itemName}</span>
      ),
    },
    {
      field: 'dueDate',
      headerName: '납기일',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-base)]">{params.row.dueDate}</span>
      ),
    },
    {
      field: 'processId',
      headerName: '공정',
      minWidth: 220,
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const draft = getDraft(drafts, params.row)

        if (editingId !== params.row.id) {
          return (
            <span className="truncate text-[var(--text-base)]">{formatProcess(params.row)}</span>
          )
        }

        return (
          <ProcessSelectCell
            processes={processes}
            value={draft.processId}
            disabled={!canEditWorkOrder(params.row) || isSaving}
            onChange={(processId) => onChangeProcess(params.row, processId)}
          />
        )
      },
    },
    {
      field: 'equipmentId',
      headerName: '설비',
      minWidth: 260,
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const draft = getDraft(drafts, params.row)

        if (editingId !== params.row.id) {
          return (
            <span className="truncate text-[var(--text-base)]">{formatEquipment(params.row)}</span>
          )
        }

        return (
          <EquipmentSelectCell
            processId={draft.processId}
            value={draft.equipmentId}
            disabled={!canEditWorkOrder(params.row) || isSaving}
            onChange={(equipmentId) => onChangeEquipment(params.row, equipmentId)}
          />
        )
      },
    },
    {
      field: 'actions',
      headerName: '저장',
      width: 86,
      sortable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const draft = getDraft(drafts, params.row)
        const isDirty =
          draft.processId !== params.row.processId || draft.equipmentId !== params.row.equipmentId

        return (
          <div className={actionCellClass}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onSave(params.row)
                setEditingId(null)
              }}
              disabled={!canEditWorkOrder(params.row) || !isDirty || isSaving}
              className={saveIconButtonClass}
              title="배정 저장"
            >
              <Save size={17} />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <div
      className="h-full"
      onClickCapture={(event) => {
        if (editingId === null) return

        const target = event.target as HTMLElement
        const editingRow = target.closest('.MuiDataGrid-row.assignment-editing')

        if (!editingRow) {
          setEditingId(null)
        }
      }}
    >
      <AppDataGrid<WorkOrderResponse>
        rows={workOrders}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        onRowClick={(params) => {
          if (!canEditWorkOrder(params.row)) return

          if (editingId !== null && editingId !== params.row.id) {
            setEditingId(null)
            return
          }

          setEditingId(params.row.id)
        }}
        getRowClassName={(params) => (params.row.id === editingId ? 'assignment-editing' : '')}
        pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: DATA_GRID_DEFAULT_PAGE_SIZE },
          },
        }}
        localeText={{ noRowsLabel: '등록된 작업지시가 없습니다.' }}
        sx={{
          minHeight: 420,
          border: 'none',
          borderRadius: 0,
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-row.assignment-editing': {
            bgcolor: 'color-mix(in srgb, var(--primary-soft) 40%, transparent)',
            '&:hover': {
              bgcolor: 'color-mix(in srgb, var(--primary-soft) 40%, transparent)',
            },
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
          },
        }}
      />
    </div>
  )
}

export default WorkOrderAssignmentDataGrid
