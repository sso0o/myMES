import { Pencil, Trash2 } from 'lucide-react'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import Badge from '@/common/components/Badge'
import { deleteIconButtonClass, editIconButtonClass } from '@/common/styles/button'
import type { ProcessResponse } from '@/features/prod-basic/process/types'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'

interface ProcessDataGridProps {
  processes: ProcessResponse[]
  loading: boolean
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (process: ProcessResponse) => void
  onDelete: (process: ProcessResponse) => void
}

const formatDate = (value: string) => new Date(value).toLocaleDateString('ko-KR')

const ProcessDataGrid = ({
  processes,
  loading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: ProcessDataGridProps) => {
  const columns: GridColDef<ProcessResponse>[] = [
    {
      field: 'processCode',
      headerName: '공정코드',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-[var(--text-base)]">{params.row.processCode}</span>
      ),
    },
    {
      field: 'processName',
      headerName: '공정명',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-strong)]">{params.row.processName}</span>
      ),
    },
    {
      field: 'processTypeName',
      headerName: '공정유형',
      width: 140,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.row.processTypeName) {
          return <span className="text-[var(--text-muted)]">-</span>
        }

        return <Badge shape="rounded">{params.row.processTypeName}</Badge>
      },
    },
    {
      field: 'standardTime',
      headerName: '표준시간(분)',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'right',
      renderCell: (params) => (
        <span className="text-[var(--text-base)]">
          {params.row.standardTime != null ? params.row.standardTime.toLocaleString() : '-'}
        </span>
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
        const process = params.row

        return (
          <div className={actionCellClass}>
            <button
              type="button"
              onClick={() => onEdit(process)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(process)}
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
    <AppDataGrid<ProcessResponse>
      rows={processes}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      paginationModel={{ page: currentPage, pageSize }}
      onPaginationModelChange={handlePaginationModelChange}
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      localeText={{ noRowsLabel: '등록된 공정이 없습니다.' }}
      sx={{
        minHeight: 420,
      }}
    />
  )
}

export default ProcessDataGrid
