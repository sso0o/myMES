import { Pencil, Trash2 } from 'lucide-react'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import Badge from '@/common/components/Badge'
import { deleteIconButtonClass, editIconButtonClass } from '@/common/styles/button'
import {
  MEASUREMENT_TYPE_LABEL,
} from '@/features/quality/inspection-item/types'
import type { InspectionStandardResponse } from '../types'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'

interface InspectionStandardDataGridProps {
  inspectionStandards: InspectionStandardResponse[]
  loading: boolean
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (inspectionStandard: InspectionStandardResponse) => void
  onDelete: (inspectionStandard: InspectionStandardResponse) => void
}

const formatNullable = (value: string | number | null) => value ?? '-'

const InspectionStandardDataGrid = ({
  inspectionStandards,
  loading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: InspectionStandardDataGridProps) => {
  const columns: GridColDef<InspectionStandardResponse>[] = [
    {
      field: 'inspectionItemCode',
      headerName: '항목코드',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-[var(--text-base)]">{params.row.inspectionItemCode}</span>
      ),
    },
    {
      field: 'inspectionItemName',
      headerName: '검사항목',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-strong)]">{params.row.inspectionItemName}</span>
      ),
    },
    {
      field: 'categoryName',
      headerName: '분류',
      width: 110,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <Badge shape="rounded">{params.row.categoryName}</Badge>,
    },
    {
      field: 'measurementType',
      headerName: '측정방식',
      width: 120,
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
      field: 'inspectionMethodName',
      headerName: '검사방식',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-base)]">{params.row.inspectionMethodName}</span>
      ),
    },
    {
      field: 'standardValue',
      headerName: '기준값',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{formatNullable(params.row.standardValue)}</span>
      ),
    },
    {
      field: 'lowerLimit',
      headerName: '하한',
      width: 90,
      sortable: false,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{formatNullable(params.row.lowerLimit)}</span>
      ),
    },
    {
      field: 'upperLimit',
      headerName: '상한',
      width: 90,
      sortable: false,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{formatNullable(params.row.upperLimit)}</span>
      ),
    },
    {
      field: 'unit',
      headerName: '단위',
      width: 80,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{formatNullable(params.row.unit)}</span>
      ),
    },
    {
      field: 'sampleQty',
      headerName: '샘플수',
      width: 90,
      sortable: false,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">{formatNullable(params.row.sampleQty)}</span>
      ),
    },
    {
      field: 'isRequired',
      headerName: '필수',
      width: 80,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Badge variant={params.row.isRequired ? 'success' : 'muted'}>
          {params.row.isRequired ? '필수' : '선택'}
        </Badge>
      ),
    },
    {
      field: 'isActive',
      headerName: '상태',
      width: 80,
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
        const inspectionStandard = params.row

        return (
          <div className={actionCellClass}>
            <button
              type="button"
              onClick={() => onEdit(inspectionStandard)}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(inspectionStandard)}
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
    <AppDataGrid<InspectionStandardResponse>
      rows={inspectionStandards}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      paginationModel={{ page: currentPage, pageSize }}
      onPaginationModelChange={handlePaginationModelChange}
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      localeText={{ noRowsLabel: '등록된 공정 검사항목이 없습니다.' }}
      sx={{ minHeight: 420 }}
    />
  )
}

export default InspectionStandardDataGrid
