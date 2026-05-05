import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { GridColDef } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import {
  cancelIconButtonClass,
  deleteIconButtonClass,
  editIconButtonClass,
  saveIconButtonClass,
} from '@/common/styles/button'
import { inlineInputClass } from '@/common/styles/form'
import type { ItemResponse } from '@/features/master/item/types'
import type { BomResponse } from '@/features/prod-basic/bom/types'

export interface BomInlineRow {
  materialItemId: string
  sequence: string
  quantity: string
  description: string
}

const NEW_ROW_ID = -1
const DATA_GRID_DEFAULT_PAGE_SIZE = 25
const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'
const compactActionCellClass = 'flex h-full w-full items-center justify-center gap-1'
const sequenceInputClass = `${inlineInputClass} min-w-20 text-center`
const quantityInputClass = `${inlineInputClass} min-w-28 text-right`

interface BomDataGridProps {
  boms: BomResponse[]
  materialOptions: ItemResponse[]
  loading: boolean
  addingRow: boolean
  editingId: number | null
  newRow: BomInlineRow
  editRow: BomInlineRow
  isCreating: boolean
  isUpdating: boolean
  onCancelAdd: () => void
  onChangeNewRow: (row: BomInlineRow) => void
  onSaveAdd: () => void
  onStartEdit: (bom: BomResponse) => void
  onCancelEdit: () => void
  onChangeEditRow: (row: BomInlineRow) => void
  onSaveEdit: (bom: BomResponse) => void
  onDelete: (bom: BomResponse) => void
}

const createNewRow = (): BomResponse => ({
  id: NEW_ROW_ID,
  parentItemId: 0,
  parentItemCode: '',
  parentItemName: '',
  materialItemId: 0,
  materialItemCode: '',
  materialItemName: '',
  materialItemTypeName: null,
  unit: '',
  sequence: 0,
  quantity: 0,
  description: null,
  versionId: 0,
  versionNo: 0,
  versionStatus: 'ACTIVE',
  createdAt: '',
})

const BomDataGrid = ({
  boms,
  materialOptions,
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
}: BomDataGridProps) => {
  const getMaterial = (materialItemId: number) =>
    materialOptions.find((item) => item.id === materialItemId)
  const sortedBoms = boms.slice().sort((a, b) => a.sequence - b.sequence)
  const rows = addingRow ? [...sortedBoms, createNewRow()] : sortedBoms

  const getSelectedMaterialId = (bom: BomResponse) => {
    if (bom.id === NEW_ROW_ID) {
      return parseInt(newRow.materialItemId, 10)
    }

    if (bom.id === editingId) {
      return parseInt(editRow.materialItemId, 10)
    }

    return bom.materialItemId
  }

  const columns: GridColDef<BomResponse>[] = [
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
            <input
              className={sequenceInputClass}
              type="number"
              min={1}
              value={newRow.sequence}
              onChange={(event) => onChangeNewRow({ ...newRow, sequence: event.target.value })}
              placeholder="1"
            />
          )
        }

        if (params.row.id === editingId) {
          return (
            <input
              className={sequenceInputClass}
              type="number"
              min={1}
              value={editRow.sequence}
              onChange={(event) => onChangeEditRow({ ...editRow, sequence: event.target.value })}
              autoFocus
            />
          )
        }

        return <span className="text-[var(--text-base)]">{params.row.sequence}</span>
      },
    },
    {
      field: 'materialItemCode',
      headerName: '자재코드',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return <span className="font-mono text-xs text-[var(--text-muted)]">자재 선택</span>
        }

        if (params.row.id === editingId) {
          return <span className="font-mono text-xs text-[var(--text-muted)]">자재 변경</span>
        }

        return (
          <span className="font-mono text-[var(--text-base)]">
            {params.row.materialItemCode}
          </span>
        )
      },
    },
    {
      field: 'materialItemName',
      headerName: '자재명',
      flex: 1,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <select
              className={inlineInputClass}
              value={newRow.materialItemId}
              onChange={(event) =>
                onChangeNewRow({ ...newRow, materialItemId: event.target.value })
              }
              autoFocus
            >
              <option value="">자재 선택</option>
              {materialOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemCode} - {item.itemName}
                </option>
              ))}
            </select>
          )
        }

        if (params.row.id === editingId) {
          return (
            <select
              className={inlineInputClass}
              value={editRow.materialItemId}
              onChange={(event) =>
                onChangeEditRow({ ...editRow, materialItemId: event.target.value })
              }
            >
              <option value="">자재 선택</option>
              {materialOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemCode} - {item.itemName}
                </option>
              ))}
            </select>
          )
        }

        return (
          <span className="truncate text-[var(--text-strong)]">
            {params.row.materialItemName}
          </span>
        )
      },
    },
    {
      field: 'materialItemTypeName',
      headerName: '자재구분',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const materialId = getSelectedMaterialId(params.row)
        const itemTypeName = Number.isNaN(materialId)
          ? null
          : getMaterial(materialId)?.itemTypeName

        return <span className="text-[var(--text-muted)]">{itemTypeName ?? '-'}</span>
      },
    },
    {
      field: 'quantity',
      headerName: '소요수량',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'right',
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <input
              className={quantityInputClass}
              type="number"
              min="0.000001"
              step="0.000001"
              value={newRow.quantity}
              onChange={(event) => onChangeNewRow({ ...newRow, quantity: event.target.value })}
              placeholder="1"
            />
          )
        }

        if (params.row.id === editingId) {
          return (
            <input
              className={quantityInputClass}
              type="number"
              min="0.000001"
              step="0.000001"
              value={editRow.quantity}
              onChange={(event) => onChangeEditRow({ ...editRow, quantity: event.target.value })}
            />
          )
        }

        return (
          <span className="text-[var(--text-base)]">
            {Number(params.row.quantity).toLocaleString()}
          </span>
        )
      },
    },
    {
      field: 'unit',
      headerName: '단위',
      width: 90,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const materialId = getSelectedMaterialId(params.row)
        const unit = Number.isNaN(materialId) ? null : getMaterial(materialId)?.unit

        return <span className="text-[var(--text-muted)]">{unit ?? params.row.unit ?? '-'}</span>
      },
    },
    {
      field: 'description',
      headerName: '비고/설명',
      width: 220,
      sortable: false,
      renderCell: (params) => {
        if (params.row.id === NEW_ROW_ID) {
          return (
            <input
              className={inlineInputClass}
              value={newRow.description}
              onChange={(event) => onChangeNewRow({ ...newRow, description: event.target.value })}
              placeholder="비고"
              maxLength={500}
            />
          )
        }

        if (params.row.id === editingId) {
          return (
            <input
              className={inlineInputClass}
              value={editRow.description}
              onChange={(event) => onChangeEditRow({ ...editRow, description: event.target.value })}
              maxLength={500}
            />
          )
        }

        return (
          <span className="truncate text-[var(--text-muted)]">
            {params.row.description ?? '-'}
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
        const bom = params.row

        if (bom.id === NEW_ROW_ID) {
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

        if (bom.id === editingId) {
          return (
            <div className={compactActionCellClass}>
              <button
                type="button"
                onClick={() => onSaveEdit(bom)}
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
              onClick={() => onStartEdit(bom)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(bom)}
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
    <AppDataGrid<BomResponse>
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
      localeText={{ noRowsLabel: '등록된 자재가 없습니다.' }}
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

export default BomDataGrid
