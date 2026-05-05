import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { GridColDef } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import AppGridInput from '@/common/components/AppGridInput'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import {
  cancelIconButtonClass,
  deleteIconButtonClass,
  editIconButtonClass,
  saveIconButtonClass,
} from '@/common/styles/button'
import type { ProcessResponse } from '@/features/prod-basic/process/types'
import type { ItemProcessResponse } from '@/features/prod-basic/item-process/types'

export interface ItemProcessInlineRow {
  processId: string
  sequence: string
}

const NEW_ROW_ID = -1
const DATA_GRID_DEFAULT_PAGE_SIZE = 25
const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'
const compactActionCellClass = 'flex h-full w-full items-center justify-center gap-1'
interface ItemProcessDataGridProps {
  itemProcesses: ItemProcessResponse[]
  processOptions: ProcessResponse[]
  loading: boolean
  addingRow: boolean
  editingId: number | null
  newRow: ItemProcessInlineRow
  editRow: ItemProcessInlineRow
  isCreating: boolean
  isUpdating: boolean
  onCancelAdd: () => void
  onChangeNewRow: (row: ItemProcessInlineRow) => void
  onSaveAdd: () => void
  onStartEdit: (itemProcess: ItemProcessResponse) => void
  onCancelEdit: () => void
  onChangeEditRow: (row: ItemProcessInlineRow) => void
  onSaveEdit: (itemProcess: ItemProcessResponse) => void
  onDelete: (itemProcess: ItemProcessResponse) => void
}

const createNewRow = (): ItemProcessResponse => ({
  id: NEW_ROW_ID,
  itemId: 0,
  itemCode: '',
  itemName: '',
  processId: 0,
  processCode: '',
  processName: '',
  sequence: 0,
  createdAt: '',
})

const ItemProcessDataGrid = ({
  itemProcesses,
  processOptions,
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
}: ItemProcessDataGridProps) => {
  const activeProcesses = processOptions.filter((process) => process.isActive)
  const getProcess = (processId: number) =>
    processOptions.find((process) => process.id === processId)
  const sortedProcesses = itemProcesses.slice().sort((a, b) => a.sequence - b.sequence)
  const rows = addingRow ? [...sortedProcesses, createNewRow()] : sortedProcesses

  const columns: GridColDef<ItemProcessResponse>[] = [
    {
      field: 'sequence',
      headerName: '순서',
      width: 90,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <AppGridInput
              type="number"
              value={newRow.sequence}
              onChange={(event) => onChangeNewRow({ ...newRow, sequence: event.target.value })}
              placeholder="1"
              slotProps={{ htmlInput: { min: 1 } }}
              sx={{ minWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
            />
          )
        }

        if (params.row.id === editingId) {
          return (
            <AppGridInput
              type="number"
              value={editRow.sequence}
              onChange={(event) => onChangeEditRow({ ...editRow, sequence: event.target.value })}
              autoFocus
              slotProps={{ htmlInput: { min: 1 } }}
              sx={{ minWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
            />
          )
        }

        return <span className="text-[var(--text-base)]">{params.row.sequence}</span>
      },
    },
    {
      field: 'processCode',
      headerName: '공정코드',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return <span className="font-mono text-xs text-[var(--text-muted)]">공정 선택</span>
        }

        if (params.row.id === editingId) {
          return <span className="font-mono text-xs text-[var(--text-muted)]">공정 변경</span>
        }

        return (
          <span className="font-mono text-[var(--text-base)]">{params.row.processCode}</span>
        )
      },
    },
    {
      field: 'processName',
      headerName: '공정명',
      flex: 1,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <AppSelect
              value={newRow.processId}
              onChange={(event) => onChangeNewRow({ ...newRow, processId: event.target.value })}
              autoFocus
            >
              <AppMenuItem value="">공정 선택</AppMenuItem>
              {activeProcesses.map((process) => (
                <AppMenuItem key={process.id} value={String(process.id)}>
                  {process.processCode} - {process.processName}
                </AppMenuItem>
              ))}
            </AppSelect>
          )
        }

        if (params.row.id === editingId) {
          return (
            <AppSelect
              value={editRow.processId}
              onChange={(event) => onChangeEditRow({ ...editRow, processId: event.target.value })}
            >
              <AppMenuItem value="">공정 선택</AppMenuItem>
              {activeProcesses.map((process) => (
                <AppMenuItem key={process.id} value={String(process.id)}>
                  {process.processCode} - {process.processName}
                </AppMenuItem>
              ))}
            </AppSelect>
          )
        }

        return <span className="truncate text-[var(--text-strong)]">{params.row.processName}</span>
      },
    },
    {
      field: 'processTypeName',
      headerName: '공정유형',
      width: 140,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const processId =
          params.row.id === NEW_ROW_ID
            ? parseInt(newRow.processId, 10)
            : params.row.id === editingId
              ? parseInt(editRow.processId, 10)
              : params.row.processId

        return (
          <span className="text-[var(--text-muted)]">
            {Number.isNaN(processId) ? '-' : (getProcess(processId)?.processTypeName ?? '-')}
          </span>
        )
      },
    },
    {
      field: 'standardTime',
      headerName: '표준시간(분)',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const processId =
          params.row.id === NEW_ROW_ID
            ? parseInt(newRow.processId, 10)
            : params.row.id === editingId
              ? parseInt(editRow.processId, 10)
              : params.row.processId

        return (
          <span className="text-[var(--text-muted)]">
            {Number.isNaN(processId) ? '-' : (getProcess(processId)?.standardTime ?? '-')}
          </span>
        )
      },
    },
    {
      field: 'description',
      headerName: '비고/설명',
      width: 220,
      sortable: false,
      renderCell: (params) => {
        const processId =
          params.row.id === NEW_ROW_ID
            ? parseInt(newRow.processId, 10)
            : params.row.id === editingId
              ? parseInt(editRow.processId, 10)
              : params.row.processId

        return (
          <span className="truncate text-[var(--text-muted)]">
            {Number.isNaN(processId) ? '-' : (getProcess(processId)?.description ?? '-')}
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
        const itemProcess = params.row

        if (itemProcess.id === NEW_ROW_ID) {
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

        if (itemProcess.id === editingId) {
          return (
            <div className={compactActionCellClass}>
              <button
                type="button"
                onClick={() => onSaveEdit(itemProcess)}
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
              onClick={() => onStartEdit(itemProcess)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(itemProcess)}
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
    <AppDataGrid<ItemProcessResponse>
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
      localeText={{ noRowsLabel: '등록된 공정이 없습니다.' }}
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

export default ItemProcessDataGrid
