import { Pencil, Trash2 } from 'lucide-react'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import Badge from '@/common/components/Badge'
import { deleteIconButtonClass, editIconButtonClass } from '@/common/styles/button'
import type { QualityInspectionResponse } from '../types'
import {
  QualityInspectionResult,
  QualityInspectionStatus,
  QualityInspectionType,
} from '../types'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'

interface QualityInspectionDataGridProps {
  inspections: QualityInspectionResponse[]
  loading: boolean
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (inspection: QualityInspectionResponse) => void
  onDelete: (inspection: QualityInspectionResponse) => void
}

const inspectionTypeLabel = {
  [QualityInspectionType.INCOMING]: '수입검사',
  [QualityInspectionType.IN_PROCESS]: '공정검사',
  [QualityInspectionType.FINAL]: '최종검사',
}

const statusLabel = {
  [QualityInspectionStatus.WAITING]: '대기',
  [QualityInspectionStatus.IN_PROGRESS]: '검사중',
  [QualityInspectionStatus.COMPLETED]: '완료',
}

const resultLabel = {
  [QualityInspectionResult.PASS]: '합격',
  [QualityInspectionResult.FAIL]: '불합격',
  [QualityInspectionResult.HOLD]: '보류',
}

const resultVariant = {
  [QualityInspectionResult.PASS]: 'success',
  [QualityInspectionResult.FAIL]: 'muted',
  [QualityInspectionResult.HOLD]: 'primary',
} as const

const formatDate = (value: string) => new Date(value).toLocaleDateString('ko-KR')

const QualityInspectionDataGrid = ({
  inspections,
  loading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: QualityInspectionDataGridProps) => {
  const columns: GridColDef<QualityInspectionResponse>[] = [
    {
      field: 'inspectionNo',
      headerName: '검사번호',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-[var(--text-base)]">{params.row.inspectionNo}</span>
      ),
    },
    {
      field: 'inspectionDate',
      headerName: '검사일자',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-base)]">{formatDate(params.row.inspectionDate)}</span>
      ),
    },
    {
      field: 'inspectionType',
      headerName: '검사유형',
      width: 110,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Badge shape="rounded">{inspectionTypeLabel[params.row.inspectionType]}</Badge>
      ),
    },
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <Badge variant="muted">{statusLabel[params.row.status]}</Badge>,
    },
    {
      field: 'result',
      headerName: '판정',
      width: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Badge variant={resultVariant[params.row.result]}>{resultLabel[params.row.result]}</Badge>
      ),
    },
    {
      field: 'itemName',
      headerName: '품목',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <div className="flex min-w-0 flex-col justify-center">
          <span className="truncate text-[var(--text-strong)]">{params.row.itemName}</span>
          <span className="truncate font-mono text-xs text-[var(--text-muted)]">
            {params.row.itemCode}
          </span>
        </div>
      ),
    },
    {
      field: 'processName',
      headerName: '공정',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-base)]">
          {params.row.processName ?? '-'}
        </span>
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
      field: 'inspectionQty',
      headerName: '검사',
      width: 90,
      sortable: false,
      headerAlign: 'center',
      align: 'right',
      renderCell: (params) => params.row.inspectionQty.toLocaleString(),
    },
    {
      field: 'passQty',
      headerName: '합격',
      width: 90,
      sortable: false,
      headerAlign: 'center',
      align: 'right',
      renderCell: (params) => params.row.passQty.toLocaleString(),
    },
    {
      field: 'defectQty',
      headerName: '불량',
      width: 90,
      sortable: false,
      headerAlign: 'center',
      align: 'right',
      renderCell: (params) => params.row.defectQty.toLocaleString(),
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
        const inspection = params.row

        return (
          <div className={actionCellClass}>
            <button
              type="button"
              onClick={() => onEdit(inspection)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(inspection)}
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
    <AppDataGrid<QualityInspectionResponse>
      rows={inspections}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      paginationModel={{ page: currentPage, pageSize }}
      onPaginationModelChange={handlePaginationModelChange}
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      localeText={{ noRowsLabel: '등록된 품질검사가 없습니다.' }}
      sx={{ minHeight: 480 }}
    />
  )
}

export default QualityInspectionDataGrid
