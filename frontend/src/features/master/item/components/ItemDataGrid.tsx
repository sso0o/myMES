import { Pencil, Trash2 } from 'lucide-react'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import { deleteIconButtonClass, editIconButtonClass } from '@/common/styles/button'
import type { ItemResponse } from '@/features/master/item/types'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'

interface ItemDataGridProps {
  items: ItemResponse[]
  loading: boolean
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (item: ItemResponse) => void
  onDelete: (item: ItemResponse) => void
}

const formatDate = (value: string) => new Date(value).toLocaleDateString('ko-KR')

const ItemDataGrid = ({
  items,
  loading,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: ItemDataGridProps) => {
  const columns: GridColDef<ItemResponse>[] = [
    {
      field: 'itemCode',
      headerName: '품목코드',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-[var(--text-base)]">{params.row.itemCode}</span>
      ),
    },
    {
      field: 'itemName',
      headerName: '품목명',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-strong)]">{params.row.itemName}</span>
      ),
    },
    {
      field: 'unit',
      headerName: '단위',
      width: 110,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'createdAt',
      headerName: '등록일',
      width: 140,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{formatDate(params.row.createdAt)}</span>
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
        const item = params.row

        return (
          <div className={actionCellClass}>
            <button
              type="button"
              onClick={() => onEdit(item)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
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

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (model.pageSize !== pageSize) {
      onPageSizeChange(model.pageSize)
      return
    }

    onPageChange(model.page)
  }

  return (
    <AppDataGrid<ItemResponse>
      rows={items}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      paginationMode="server"
      rowCount={totalItems}
      paginationModel={{ page: currentPage, pageSize }}
      onPaginationModelChange={handlePaginationModelChange}
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      localeText={{ noRowsLabel: '등록된 품목이 없습니다.' }}
      sx={{
        minHeight: 420,
      }}
    />
  )
}

export default ItemDataGrid
