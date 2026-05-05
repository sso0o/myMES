import type { Dispatch, SetStateAction } from 'react'
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
import type { CommonCodeResponse } from '@/features/master/commonCode/types'

export interface NewCodeRow {
  codeName: string
  sortOrder: string
  numberingPrefix: string
}

export interface EditCodeRow {
  codeName: string
  sortOrder: string
  numberingPrefix: string
}

const NEW_ROW_ID = -1
const DATA_GRID_DEFAULT_PAGE_SIZE = 25
const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'
const compactActionCellClass = 'flex h-full w-full items-center justify-center gap-1'

interface CommonCodeDataGridProps {
  rows: CommonCodeResponse[]
  editingId: number | null
  newRow: NewCodeRow
  editRow: EditCodeRow
  createPending: boolean
  updatePending: boolean
  onNewRowChange: Dispatch<SetStateAction<NewCodeRow>>
  onEditRowChange: Dispatch<SetStateAction<EditCodeRow>>
  onSaveAdd: () => void
  onCancelAdd: () => void
  onStartEdit: (code: CommonCodeResponse) => void
  onSaveEdit: (codeId: number) => void
  onCancelEdit: () => void
  onDeleteCode: (code: CommonCodeResponse) => void
}

const CommonCodeDataGrid = ({
  rows,
  editingId,
  newRow,
  editRow,
  createPending,
  updatePending,
  onNewRowChange,
  onEditRowChange,
  onSaveAdd,
  onCancelAdd,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteCode,
}: CommonCodeDataGridProps) => {
  const codeColumns: GridColDef<CommonCodeResponse>[] = [
    {
      field: 'code',
      headerName: '코드값',
      width: 130,
      sortable: false,
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <input
              className={`${inlineInputClass} font-mono bg-[var(--surface-alt)] text-[var(--text-muted)]`}
              value=""
              placeholder="저장 시 자동 채번"
              readOnly
            />
          )
        }

        return <span className="font-mono text-[var(--text-base)]">{params.row.code}</span>
      },
    },
    {
      field: 'codeName',
      headerName: '코드명',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <input
              className={inlineInputClass}
              value={newRow.codeName}
              onChange={(event) =>
                onNewRowChange((row) => ({ ...row, codeName: event.target.value }))
              }
              placeholder="예: 대기"
              maxLength={100}
              autoFocus
            />
          )
        }

        if (params.row.id === editingId) {
          return (
            <input
              className={inlineInputClass}
              value={editRow.codeName}
              onChange={(event) =>
                onEditRowChange((row) => ({ ...row, codeName: event.target.value }))
              }
              maxLength={100}
              autoFocus
            />
          )
        }

        return <span className="text-[var(--text-strong)]">{params.row.codeName}</span>
      },
    },
    {
      field: 'numberingPrefix',
      headerName: '채번코드',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <input
              className={`${inlineInputClass} font-mono text-center`}
              value={newRow.numberingPrefix}
              onChange={(event) =>
                onNewRowChange((row) => ({
                  ...row,
                  numberingPrefix: event.target.value.toUpperCase(),
                }))
              }
              maxLength={20}
              placeholder="예: RM"
            />
          )
        }

        if (params.row.id === editingId) {
          return (
            <input
              className={`${inlineInputClass} font-mono text-center`}
              value={editRow.numberingPrefix}
              onChange={(event) =>
                onEditRowChange((row) => ({
                  ...row,
                  numberingPrefix: event.target.value.toUpperCase(),
                }))
              }
              maxLength={20}
              placeholder="예: RM"
            />
          )
        }

        return (
          <span className="font-mono text-[var(--text-muted)]">
            {params.row.numberingPrefix ?? '-'}
          </span>
        )
      },
    },
    {
      field: 'sortOrder',
      headerName: '정렬',
      width: 90,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <input
              className={`${inlineInputClass} text-center`}
              type="number"
              min={1}
              value={newRow.sortOrder}
              onChange={(event) =>
                onNewRowChange((row) => ({ ...row, sortOrder: event.target.value }))
              }
              placeholder="1"
            />
          )
        }

        if (params.row.id === editingId) {
          return (
            <input
              className={`${inlineInputClass} text-center`}
              type="number"
              min={1}
              value={editRow.sortOrder}
              onChange={(event) =>
                onEditRowChange((row) => ({ ...row, sortOrder: event.target.value }))
              }
            />
          )
        }

        return <span className="text-[var(--text-muted)]">{params.row.sortOrder}</span>
      },
    },
    {
      field: 'isActive',
      headerName: '상태',
      width: 80,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) return null

        return (
          <Badge variant={params.row.isActive ? 'success' : 'muted'}>
            {params.row.isActive ? '활성' : '비활성'}
          </Badge>
        )
      },
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 90,
      sortable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const code = params.row

        if (code.id === NEW_ROW_ID) {
          return (
            <div className={compactActionCellClass}>
              <button
                type="button"
                onClick={onSaveAdd}
                disabled={createPending}
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

        if (code.id === editingId) {
          return (
            <div className={compactActionCellClass}>
              <button
                type="button"
                onClick={() => onSaveEdit(code.id)}
                disabled={updatePending}
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
              onClick={() => onStartEdit(code)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDeleteCode(code)}
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
    <AppDataGrid<CommonCodeResponse>
      rows={rows}
      columns={codeColumns}
      getRowId={(row) => row.id}
      getRowClassName={(params) => {
        const rowId = params.id as number
        return rowId === editingId || rowId === NEW_ROW_ID ? 'inline-editing' : ''
      }}
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: DATA_GRID_DEFAULT_PAGE_SIZE },
        },
      }}
      localeText={{ noRowsLabel: '등록된 코드가 없습니다.' }}
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

export { NEW_ROW_ID }
export default CommonCodeDataGrid
