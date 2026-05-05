import type { GridColDef } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import Badge from '@/common/components/Badge'
import type { ItemResponse } from '@/features/master/item/types'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

interface BomItemDataGridProps {
  items: ItemResponse[]
  loading: boolean
  selectedItemId: number | null
  onSelectItem: (item: ItemResponse) => void
}

const BomItemDataGrid = ({
  items,
  loading,
  selectedItemId,
  onSelectItem,
}: BomItemDataGridProps) => {
  const columns: GridColDef<ItemResponse>[] = [
    {
      field: 'itemCode',
      headerName: '품목코드',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <span
          className={`truncate font-mono text-sm ${
            selectedItemId === params.row.id
              ? 'text-[var(--primary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {params.row.itemCode}
        </span>
      ),
    },
    {
      field: 'itemName',
      headerName: '품목명',
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <span
          className={`truncate text-sm font-medium ${
            selectedItemId === params.row.id
              ? 'text-[var(--primary)]'
              : 'text-[var(--text-strong)]'
          }`}
        >
          {params.row.itemName}
        </span>
      ),
    },
    {
      field: 'itemTypeName',
      headerName: '구분',
      width: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) =>
        params.row.itemTypeName ? (
          <Badge shape="rounded">{params.row.itemTypeName}</Badge>
        ) : (
          <span className="text-[var(--text-muted)]">-</span>
        ),
    },
  ]

  return (
    <AppDataGrid<ItemResponse>
      rows={items}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      onRowClick={(params) => onSelectItem(params.row)}
      getRowClassName={(params) => (params.row.id === selectedItemId ? 'selected-bom-item' : '')}
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 10 },
        },
      }}
      localeText={{ noRowsLabel: '등록된 품목이 없습니다.' }}
      sx={{
        height: '100%',
        border: 'none',
        borderRadius: 0,
        '& .MuiDataGrid-row': {
          cursor: 'pointer',
        },
        '& .MuiDataGrid-row.selected-bom-item': {
          bgcolor: 'var(--primary-soft)',
          '&:hover': {
            bgcolor: 'var(--primary-soft)',
          },
        },
      }}
    />
  )
}

export default BomItemDataGrid
