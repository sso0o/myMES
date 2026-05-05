import { Pencil, Trash2, UserX } from 'lucide-react'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import { deleteIconButtonClass, editIconButtonClass } from '@/common/styles/button'
import type { WorkerResponse } from '../types'
import WorkerStatusBadge from './WorkerStatusBadge'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'
const resignIconButtonClass =
  'rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--text-strong)] disabled:pointer-events-none disabled:opacity-40'

interface WorkerDataGridProps {
  workers: WorkerResponse[]
  loading: boolean
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (worker: WorkerResponse) => void
  onResign: (worker: WorkerResponse) => void
  onDelete: (worker: WorkerResponse) => void
}

const formatDate = (value: string) => new Date(value).toLocaleDateString('ko-KR')
const formatOptionalDate = (value: string | null) => (value ? formatDate(value) : '-')

const WorkerDataGrid = ({
  workers,
  loading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onResign,
  onDelete,
}: WorkerDataGridProps) => {
  const columns: GridColDef<WorkerResponse>[] = [
    {
      field: 'workerCode',
      headerName: '작업자코드',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-[var(--text-base)]">{params.row.workerCode}</span>
      ),
    },
    {
      field: 'workerName',
      headerName: '작업자명',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-strong)]">{params.row.workerName}</span>
      ),
    },
    {
      field: 'department',
      headerName: '소속',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-base)]">
          {params.row.department ?? '-'}
        </span>
      ),
    },
    {
      field: 'jobTitle',
      headerName: '직무',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-base)]">{params.row.jobTitle ?? '-'}</span>
      ),
    },
    {
      field: 'phone',
      headerName: '연락처',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{params.row.phone ?? '-'}</span>
      ),
    },
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <WorkerStatusBadge status={params.row.status} />,
    },
    {
      field: 'hireDate',
      headerName: '입사일',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">
          {formatOptionalDate(params.row.hireDate)}
        </span>
      ),
    },
    {
      field: 'resignedAt',
      headerName: '퇴사일',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">
          {formatOptionalDate(params.row.resignedAt)}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 132,
      sortable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const worker = params.row
        const alreadyResigned = worker.status === 'RESIGNED'

        return (
          <div className={actionCellClass}>
            <button
              type="button"
              onClick={() => onEdit(worker)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onResign(worker)}
              className={resignIconButtonClass}
              title="퇴사 처리"
              disabled={alreadyResigned}
            >
              <UserX size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(worker)}
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
    <div className="min-h-[420px]">
      <AppDataGrid<WorkerResponse>
        rows={workers}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        paginationModel={{ page: currentPage, pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
        localeText={{ noRowsLabel: '등록된 작업자가 없습니다.' }}
      />
    </div>
  )
}

export default WorkerDataGrid
