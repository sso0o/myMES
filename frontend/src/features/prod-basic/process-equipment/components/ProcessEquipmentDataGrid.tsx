import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { GridColDef } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import Badge from '@/common/components/Badge'
import {
  cancelIconButtonClass,
  deleteIconButtonClass,
  editIconButtonClass,
  saveIconButtonClass,
} from '@/common/styles/button'
import { inlineInputClass } from '@/common/styles/form'
import type { EquipmentResponse } from '@/features/prod-basic/equipment/types'
import type { ProcessEquipmentInlineRow, ProcessEquipmentResponse } from '../types'

export type { ProcessEquipmentInlineRow }

const NEW_ROW_ID = -1
const DATA_GRID_DEFAULT_PAGE_SIZE = 25
const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'
const compactActionCellClass = 'flex h-full w-full items-center justify-center gap-1'

interface ProcessEquipmentDataGridProps {
  processEquipments: ProcessEquipmentResponse[]
  equipmentOptions: EquipmentResponse[]
  loading: boolean
  addingRow: boolean
  editingId: number | null
  newRow: ProcessEquipmentInlineRow
  editRow: ProcessEquipmentInlineRow
  isCreating: boolean
  isUpdating: boolean
  onCancelAdd: () => void
  onChangeNewRow: (row: ProcessEquipmentInlineRow) => void
  onSaveAdd: () => void
  onStartEdit: (pe: ProcessEquipmentResponse) => void
  onCancelEdit: () => void
  onChangeEditRow: (row: ProcessEquipmentInlineRow) => void
  onSaveEdit: (pe: ProcessEquipmentResponse) => void
  onDelete: (pe: ProcessEquipmentResponse) => void
}

const createNewRow = (): ProcessEquipmentResponse => ({
  id: NEW_ROW_ID,
  processId: 0,
  processCode: '',
  processName: '',
  equipmentId: 0,
  equipmentCode: '',
  equipmentName: '',
  isPrimary: false,
  createdAt: '',
  updatedAt: '',
})

const IsPrimaryToggle = ({
  value,
  onChange,
}: {
  value: boolean
  onChange: (v: boolean) => void
}) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
      value ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
        value ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
)

const ProcessEquipmentDataGrid = ({
  processEquipments,
  equipmentOptions,
  loading,
  addingRow,
  editingId,
  newRow,
  editRow,
  isCreating,
  isUpdating,
  onCancelAdd,
  onChangeNewRow,
  onSaveAdd,
  onStartEdit,
  onCancelEdit,
  onChangeEditRow,
  onSaveEdit,
  onDelete,
}: ProcessEquipmentDataGridProps) => {
  const activeEquipments = equipmentOptions.filter((e) => e.isActive)
  const rows = addingRow ? [...processEquipments, createNewRow()] : processEquipments

  const columns: GridColDef<ProcessEquipmentResponse>[] = [
    {
      field: 'isPrimary',
      headerName: '주설비',
      width: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <IsPrimaryToggle
              value={newRow.isPrimary}
              onChange={(v) => onChangeNewRow({ ...newRow, isPrimary: v })}
            />
          )
        }

        if (params.row.id === editingId) {
          return (
            <IsPrimaryToggle
              value={editRow.isPrimary}
              onChange={(v) => onChangeEditRow({ ...editRow, isPrimary: v })}
            />
          )
        }

        return (
          <Badge variant={params.row.isPrimary ? 'success' : 'muted'}>
            {params.row.isPrimary ? '주설비' : '일반'}
          </Badge>
        )
      },
    },
    {
      field: 'equipmentCode',
      headerName: '설비코드',
      width: 140,
      sortable: false,
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return <span className="font-mono text-xs text-[var(--text-muted)]">설비 선택</span>
        }

        return (
          <span className="font-mono text-[var(--text-base)]">{params.row.equipmentCode}</span>
        )
      },
    },
    {
      field: 'equipmentName',
      headerName: '설비명',
      flex: 1,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <select
              className={inlineInputClass}
              value={newRow.equipmentId}
              onChange={(e) => onChangeNewRow({ ...newRow, equipmentId: e.target.value })}
              autoFocus
            >
              <option value="">설비 선택</option>
              {activeEquipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.equipmentCode} - {eq.equipmentName}
                </option>
              ))}
            </select>
          )
        }

        return (
          <span className="truncate text-[var(--text-strong)]">{params.row.equipmentName}</span>
        )
      },
    },
    {
      field: 'createdAt',
      headerName: '배정일',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) return null
        return (
          <span className="text-[var(--text-muted)]">
            {new Date(params.row.createdAt).toLocaleDateString('ko-KR')}
          </span>
        )
      },
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 96,
      sortable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const pe = params.row

        if (pe.id === NEW_ROW_ID) {
          return (
            <div className={compactActionCellClass}>
              <button
                type="button"
                onClick={onSaveAdd}
                disabled={isCreating}
                className={saveIconButtonClass}
                title="저장"
              >
                <Check size={15} />
              </button>
              <button
                type="button"
                onClick={onCancelAdd}
                className={cancelIconButtonClass}
                title="취소"
              >
                <X size={15} />
              </button>
            </div>
          )
        }

        if (pe.id === editingId) {
          return (
            <div className={compactActionCellClass}>
              <button
                type="button"
                onClick={() => onSaveEdit(pe)}
                disabled={isUpdating}
                className={saveIconButtonClass}
                title="저장"
              >
                <Check size={15} />
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className={cancelIconButtonClass}
                title="취소"
              >
                <X size={15} />
              </button>
            </div>
          )
        }

        return (
          <div className={actionCellClass}>
            <button
              type="button"
              onClick={() => onStartEdit(pe)}
              className={editIconButtonClass}
              title="주설비 변경"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(pe)}
              className={deleteIconButtonClass}
              title="삭제"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <AppDataGrid<ProcessEquipmentResponse>
      rows={rows}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      getRowClassName={(params) =>
        params.row.id === NEW_ROW_ID || params.row.id === editingId ? 'inline-editing' : ''
      }
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: DATA_GRID_DEFAULT_PAGE_SIZE },
        },
      }}
      localeText={{ noRowsLabel: '배정된 설비가 없습니다.' }}
      sx={{
        height: '100%',
        border: 'none',
        borderRadius: 0,
        '& .MuiDataGrid-row.inline-editing': {
          bgcolor: 'color-mix(in srgb, var(--primary-soft) 40%, transparent)',
          '&:hover': {
            bgcolor: 'color-mix(in srgb, var(--primary-soft) 40%, transparent)',
          },
        },
      }}
    />
  )
}

export default ProcessEquipmentDataGrid
