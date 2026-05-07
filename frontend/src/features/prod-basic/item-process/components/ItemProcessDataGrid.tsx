import { useEffect, useState } from 'react'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { GridColDef, GridEventListener, GridRowId, GridRowModesModel } from '@mui/x-data-grid'
import {
  GridRowModes,
  GridRowEditStopReasons,
  useGridApiRef,
  useGridApiContext,
  useGridSelector,
} from '@mui/x-data-grid'
import type { SelectChangeEvent } from '@mui/material'
import AppDataGrid from '@/common/components/AppDataGrid'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import {
  cancelIconButtonClass,
  deleteIconButtonClass,
  editIconButtonClass,
  saveIconButtonClass,
} from '@/common/styles/button'
import type { ProcessResponse } from '@/features/prod-basic/process/types'
import type { ItemProcessResponse } from '@/features/prod-basic/item-process/types'

export type ItemProcessGridRow = ItemProcessResponse & { isNew?: boolean }

const NEW_ROW_ID = -1
const DATA_GRID_DEFAULT_PAGE_SIZE = 25
const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const compactActionCellClass = 'flex h-full w-full items-center justify-center gap-1'
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'

interface ProcessSelectEditCellProps {
  id: GridRowId
  field: string
  processOptions: ProcessResponse[]
  onProcessIdChange: (id: GridRowId, processId: number) => void
}

const ProcessSelectEditCell = ({
  id,
  field,
  processOptions,
  onProcessIdChange,
}: ProcessSelectEditCellProps) => {
  const apiRef = useGridApiContext()
  // v9에서는 gridEditRowsStateSelector 대신 안정적인 API 사용
  const value = useGridSelector(
    apiRef,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any) => state.editRows?.[id]?.[field]?.value ?? '',
  )

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const newValue = event.target.value as string
    void apiRef.current.setEditCellValue({ id, field, value: newValue })
    onProcessIdChange(id, Number(newValue))
  }

  return (
    <AppSelect value={String(value)} onChange={handleChange}>
      <AppMenuItem value="">공정 선택</AppMenuItem>
      {processOptions
        .filter((p) => p.isActive)
        .map((p) => (
          <AppMenuItem key={p.id} value={String(p.id)}>
            {p.processCode} - {p.processName}
          </AppMenuItem>
        ))}
    </AppSelect>
  )
}

interface DerivedValueCellProps {
  row: ItemProcessResponse
  isEditing: boolean
  currentProcessId: number | undefined
  processOptions: ProcessResponse[]
  getter: (p: ProcessResponse) => string | number | null | undefined
  className?: string
}

/** edit 중일 때 현재 선택된 processId 기준으로 파생값을 실시간 반영 */
const DerivedValueCell = ({
  row,
  isEditing,
  currentProcessId,
  processOptions,
  getter,
  className,
}: DerivedValueCellProps) => {
  const processId =
    isEditing && currentProcessId !== undefined ? currentProcessId : row.processId

  const process = processOptions.find((p) => p.id === processId)
  const val = process ? getter(process) : undefined
  return <span className={className ?? 'text-[var(--text-muted)]'}>{val ?? '-'}</span>
}

export interface ItemProcessDataGridProps {
  itemProcesses: ItemProcessResponse[]
  processOptions: ProcessResponse[]
  loading: boolean
  addingRow: boolean
  initialSequence: number
  onCancelAdd: () => void
  onProcessRowUpdate: (
    newRow: ItemProcessGridRow,
    oldRow: ItemProcessGridRow,
  ) => Promise<ItemProcessGridRow>
  onDelete: (itemProcess: ItemProcessResponse) => void
}

const ItemProcessDataGrid = ({
  itemProcesses,
  processOptions,
  loading,
  addingRow,
  initialSequence,
  onCancelAdd,
  onProcessRowUpdate,
  onDelete,
}: ItemProcessDataGridProps) => {
  const apiRef = useGridApiRef()
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})
  // edit 중인 행의 현재 선택된 processId를 로컬 state로 추적 (v9 내부 state 직접 접근 회피)
  const [editedProcessIds, setEditedProcessIds] = useState<Partial<Record<GridRowId, number>>>({})

  const sortedProcesses: ItemProcessGridRow[] = itemProcesses
    .slice()
    .sort((a, b) => a.sequence - b.sequence)

  const rows: ItemProcessGridRow[] = addingRow
    ? [
        ...sortedProcesses,
        {
          id: NEW_ROW_ID,
          itemId: 0,
          itemCode: '',
          itemName: '',
          processId: 0,
          processCode: '',
          processName: '',
          sequence: initialSequence,
          createdAt: '',
          isNew: true,
        },
      ]
    : sortedProcesses

  useEffect(() => {
    if (addingRow) {
      setTimeout(() => {
        apiRef.current?.startRowEditMode({ id: NEW_ROW_ID, fieldToFocus: 'processId' })
      }, 0)
    }
  }, [addingRow, apiRef])

  // edit mode를 벗어난 행의 추적값 정리
  useEffect(() => {
    setEditedProcessIds((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((id) => {
        if (rowModesModel[id]?.mode !== GridRowModes.Edit) {
          delete next[id]
        }
      })
      return next
    })
  }, [rowModesModel])

  const handleRowModesModelChange = (model: GridRowModesModel) => {
    setRowModesModel(model)
  }

  const handleProcessIdChange = (id: GridRowId, processId: number) => {
    setEditedProcessIds((prev) => ({ ...prev, [id]: processId }))
  }

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
    if (params.reason === GridRowEditStopReasons.escapeKeyDown && params.id === NEW_ROW_ID) {
      onCancelAdd()
    }
  }

  const handleSaveClick = (id: GridRowId) => () => {
    apiRef.current?.stopRowEditMode({ id })
  }

  const handleCancelClick = (id: GridRowId) => () => {
    apiRef.current?.stopRowEditMode({ id, ignoreModifications: true })
    if (id === NEW_ROW_ID) onCancelAdd()
  }

  const handleEditClick = (id: GridRowId) => () => {
    apiRef.current?.startRowEditMode({ id })
    // 편집 시작 시 현재 processId를 초기값으로 세팅
    const row = itemProcesses.find((ip) => ip.id === id)
    if (row) setEditedProcessIds((prev) => ({ ...prev, [id]: row.processId }))
  }

  const columns: GridColDef<ItemProcessGridRow>[] = [
    {
      field: 'sequence',
      headerName: '순서',
      width: 90,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      editable: true,
      type: 'number',
    },
    {
      field: 'processCode',
      headerName: '공정코드',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const isEditing = rowModesModel[params.id]?.mode === GridRowModes.Edit
        return (
          <DerivedValueCell
            row={params.row}
            isEditing={isEditing}
            currentProcessId={editedProcessIds[params.id]}
            processOptions={processOptions}
            getter={(p) => p.processCode}
            className="font-mono text-[var(--text-base)]"
          />
        )
      },
    },
    {
      field: 'processId',
      headerName: '공정명',
      flex: 1,
      minWidth: 220,
      sortable: false,
      editable: true,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-strong)]">{params.row.processName}</span>
      ),
      renderEditCell: (params) => (
        <ProcessSelectEditCell
          id={params.id}
          field={params.field}
          processOptions={processOptions}
          onProcessIdChange={handleProcessIdChange}
        />
      ),
    },
    {
      field: 'processTypeName',
      headerName: '공정유형',
      width: 140,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <DerivedValueCell
          row={params.row}
          isEditing={rowModesModel[params.id]?.mode === GridRowModes.Edit}
          currentProcessId={editedProcessIds[params.id]}
          processOptions={processOptions}
          getter={(p) => p.processTypeName}
        />
      ),
    },
    {
      field: 'standardTime',
      headerName: '표준시간(분)',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <DerivedValueCell
          row={params.row}
          isEditing={rowModesModel[params.id]?.mode === GridRowModes.Edit}
          currentProcessId={editedProcessIds[params.id]}
          processOptions={processOptions}
          getter={(p) => p.standardTime}
        />
      ),
    },
    {
      field: 'description',
      headerName: '비고/설명',
      width: 220,
      sortable: false,
      renderCell: (params) => (
        <DerivedValueCell
          row={params.row}
          isEditing={rowModesModel[params.id]?.mode === GridRowModes.Edit}
          currentProcessId={editedProcessIds[params.id]}
          processOptions={processOptions}
          getter={(p) => p.description}
        />
      ),
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
        const isEditing = rowModesModel[params.id]?.mode === GridRowModes.Edit

        if (isEditing) {
          return (
            <div className={compactActionCellClass}>
              <button
                type="button"
                onClick={handleSaveClick(params.id)}
                className={saveIconButtonClass}
                title="저장"
              >
                <Check size={15} />
              </button>
              <button
                type="button"
                onClick={handleCancelClick(params.id)}
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
              onClick={handleEditClick(params.id)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(params.row)}
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
    <AppDataGrid<ItemProcessGridRow>
      apiRef={apiRef}
      editMode="row"
      rows={rows}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={onProcessRowUpdate}
      onProcessRowUpdateError={(error) => console.error('row update error:', error)}
      getRowClassName={(params) =>
        rowModesModel[params.id]?.mode === GridRowModes.Edit ? 'inline-editing' : ''
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
        '& .MuiDataGrid-cell': {
          display: 'flex',
          alignItems: 'center',
        },
        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
          outlineOffset: '-1px',
        },
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
