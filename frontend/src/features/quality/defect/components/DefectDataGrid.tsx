import { Pencil } from 'lucide-react'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import Badge from '@/common/components/Badge'
import { editIconButtonClass } from '@/common/styles/button'
import type { DefectResponse } from '../types'
import { DefectAction } from '../types'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center'

interface DefectDataGridProps {
  defects: DefectResponse[]
  loading: boolean
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onUpdateAction: (defect: DefectResponse) => void
}

const actionStatusLabel: Record<DefectAction, string> = {
  [DefectAction.WAITING]: '대기',
  [DefectAction.REWORK]: '재작업',
  [DefectAction.SCRAP]: '폐기',
  [DefectAction.COMPLETED]: '완료',
}

const actionStatusVariant: Record<DefectAction, 'primary' | 'success' | 'muted'> = {
  [DefectAction.WAITING]: 'muted',
  [DefectAction.REWORK]: 'primary',
  [DefectAction.SCRAP]: 'muted',
  [DefectAction.COMPLETED]: 'success',
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const DefectDataGrid = ({
  defects,
  loading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onUpdateAction,
}: DefectDataGridProps) => {
  const columns: GridColDef<DefectResponse>[] = [
    {
      field: 'defectType',
      headerName: '불량유형',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <span className="font-medium text-[var(--text-strong)]">{params.row.defectType}</span>
      ),
    },
    {
      field: 'qty',
      headerName: '불량수량',
      width: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'right',
      renderCell: (params) => (
        <span className="font-medium text-[var(--danger)]">{params.row.qty.toLocaleString()}</span>
      ),
    },
    {
      field: 'actionStatus',
      headerName: '조치상태',
      width: 110,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Badge variant={actionStatusVariant[params.row.actionStatus]}>
          {actionStatusLabel[params.row.actionStatus]}
        </Badge>
      ),
    },
    {
      field: 'itemName',
      headerName: '품목',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) =>
        params.row.itemName ? (
          <div className="flex min-w-0 flex-col justify-center">
            <span className="truncate text-[var(--text-strong)]">{params.row.itemName}</span>
            <span className="truncate font-mono text-xs text-[var(--text-muted)]">
              {params.row.itemCode}
            </span>
          </div>
        ) : (
          <span className="text-[var(--text-muted)]">-</span>
        ),
    },
    {
      field: 'processName',
      headerName: '공정',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-base)]">{params.row.processName ?? '-'}</span>
      ),
    },
    {
      field: 'workOrderNo',
      headerName: '작업지시',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-[var(--text-base)]">{params.row.workOrderNo ?? '-'}</span>
      ),
    },
    {
      field: 'qualityInspectionNo',
      headerName: '품질검사',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-[var(--text-base)]">
          {params.row.qualityInspectionNo ?? '-'}
        </span>
      ),
    },
    {
      field: 'causeCategory',
      headerName: '원인분류',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-base)]">{params.row.causeCategory ?? '-'}</span>
      ),
    },
    {
      field: 'assigneeName',
      headerName: '담당자',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <span className="text-[var(--text-base)]">{params.row.assigneeName ?? '-'}</span>
      ),
    },
    {
      field: 'createdAt',
      headerName: '등록일시',
      width: 160,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-xs text-[var(--text-muted)]">{formatDateTime(params.row.createdAt)}</span>
      ),
    },
    {
      field: 'actions',
      headerName: '조치',
      width: 72,
      sortable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className={actionCellClass}>
          <button
            type="button"
            onClick={() => onUpdateAction(params.row)}
            className={editIconButtonClass}
            title="조치 수정"
          >
            <Pencil size={15} />
          </button>
        </div>
      ),
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
    <AppDataGrid<DefectResponse>
      rows={defects}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      paginationModel={{ page: currentPage, pageSize }}
      onPaginationModelChange={handlePaginationModelChange}
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      localeText={{ noRowsLabel: '등록된 불량 기록이 없습니다.' }}
      sx={{ minHeight: 480 }}
    />
  )
}

export default DefectDataGrid
