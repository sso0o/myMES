import { Pencil, Trash2 } from 'lucide-react'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import Badge from '@/common/components/Badge'
import { deleteIconButtonClass, editIconButtonClass } from '@/common/styles/button'
import type { InspectionItemResponse } from '../types'
import { MEASUREMENT_TYPE_LABEL } from '../types'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'

interface InspectionItemDataGridProps {
  inspectionItems: InspectionItemResponse[]
  loading: boolean
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (inspectionItem: InspectionItemResponse) => void
  onDelete: (inspectionItem: InspectionItemResponse) => void
}

const InspectionItemDataGrid = ({
  inspectionItems,
  loading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: InspectionItemDataGridProps) => {
  const columns: GridColDef<InspectionItemResponse>[] = [
    {
      field: 'inspectionItemCode',
      headerName: '코드',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-[var(--text-base)]">{params.row.inspectionItemCode}</span>
      ),
    },
    {
      field: 'inspectionItemName',
      headerName: '검사항목명',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-strong)]">{params.row.inspectionItemName}</span>
      ),
    },
    {
      field: 'categoryName',
      headerName: '분류',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <Badge shape="rounded">{params.row.categoryName}</Badge>,
    },
    {
      field: 'measurementType',
      headerName: '측정방식',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-base)]">
          {MEASUREMENT_TYPE_LABEL[params.row.measurementType]}
        </span>
      ),
    },
    {
      field: 'unit',
      headerName: '단위',
      width: 90,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{params.row.unit ?? '-'}</span>
      ),
    },
    {
      field: 'decimalScale',
      headerName: '소수점',
      width: 90,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{params.row.decimalScale ?? '-'}</span>
      ),
    },
    {
      field: 'sortOrder',
      headerName: '정렬',
      width: 80,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{params.row.sortOrder}</span>
      ),
    },
    {
      field: 'isActive',
      headerName: '사용여부',
      width: 110,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Badge variant={params.row.isActive ? 'success' : 'muted'}>
          {params.row.isActive ? '사용' : '미사용'}
        </Badge>
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
        const inspectionItem = params.row

        return (
          <div className={actionCellClass}>
            <button
              type="button"
              onClick={() => onEdit(inspectionItem)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(inspectionItem)}
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
    <AppDataGrid<InspectionItemResponse>
      rows={inspectionItems}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      paginationModel={{ page: currentPage, pageSize }}
      onPaginationModelChange={handlePaginationModelChange}
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      localeText={{ noRowsLabel: '등록된 검사항목이 없습니다.' }}
      sx={{ minHeight: 420 }}
    />
  )
}

export default InspectionItemDataGrid
