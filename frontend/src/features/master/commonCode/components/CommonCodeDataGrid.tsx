import { Check, Pencil, Trash2, X } from 'lucide-react'
import { GridRowModes, GridRowEditStopReasons } from '@mui/x-data-grid'
import type {
  GridColDef,
  GridEventListener,
  GridRowId,
  GridRowModesModel,
} from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import Badge from '@/common/components/Badge'
import {
  cancelIconButtonClass,
  deleteIconButtonClass,
  editIconButtonClass,
  saveIconButtonClass,
} from '@/common/styles/button'
import type { CommonCodeResponse } from '@/features/master/commonCode/types'

export const NEW_ROW_ID = -1

const DATA_GRID_DEFAULT_PAGE_SIZE = 25
const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const compactActionCellClass = 'flex h-full w-full items-center justify-center gap-1'
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'

const toUpperCasePreProcess = (params: { props: { value?: unknown } }) => ({
  ...params.props,
  value: (params.props.value as string)?.toUpperCase() ?? '',
})

interface CommonCodeDataGridProps {
  rows: CommonCodeResponse[]
  rowModesModel: GridRowModesModel
  isPending: boolean
  onRowModesModelChange: (model: GridRowModesModel) => void
  processRowUpdate: (updated: CommonCodeResponse) => Promise<CommonCodeResponse>
  onProcessRowUpdateError: (error: unknown) => void
  onEditRow: (id: number) => void
  onSaveRow: (id: GridRowId) => void
  onCancelRow: (id: GridRowId) => void
  onDeleteCode: (code: CommonCodeResponse) => void
}

const CommonCodeDataGrid = ({
  rows,
  rowModesModel,
  isPending,
  onRowModesModelChange,
  processRowUpdate,
  onProcessRowUpdateError,
  onEditRow,
  onSaveRow,
  onCancelRow,
  onDeleteCode,
}: CommonCodeDataGridProps) => {
  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const codeColumns: GridColDef<CommonCodeResponse>[] = [
    {
      field: 'code',
      headerName: '코드값',
      width: 130,
      sortable: false,
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <span className="font-mono text-[var(--text-muted)]">자동 채번</span>
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
      editable: true,
      renderCell: (params) => (
        <span className="text-[var(--text-strong)]">{params.row.codeName}</span>
      ),
    },
    {
      field: 'numberingPrefix',
      headerName: '채번코드',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      editable: true,
      preProcessEditCellProps: toUpperCasePreProcess,
      renderCell: (params) => (
        <span className="font-mono text-[var(--text-muted)]">
          {params.row.numberingPrefix ?? '-'}
        </span>
      ),
    },
    {
      field: 'sortOrder',
      headerName: '정렬',
      width: 90,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      editable: true,
      type: 'number',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{params.row.sortOrder}</span>
      ),
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
        const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          return (
            <div className={compactActionCellClass}>
              <button
                type="button"
                onClick={() => onSaveRow(params.id)}
                disabled={isPending}
                className={saveIconButtonClass}
                title="저장"
              >
                <Check size={15} />
              </button>
              <button
                type="button"
                onClick={() => onCancelRow(params.id)}
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
              onClick={() => onEditRow(params.row.id)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDeleteCode(params.row)}
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
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={onRowModesModelChange}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={onProcessRowUpdateError}
      getRowId={(row) => row.id}
      getRowClassName={(params) =>
        rowModesModel[params.id]?.mode === GridRowModes.Edit ? 'inline-editing' : ''
      }
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

export default CommonCodeDataGrid
