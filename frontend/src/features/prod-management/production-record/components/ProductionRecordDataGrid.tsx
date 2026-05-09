import type { GridColDef } from '@mui/x-data-grid'
import { Pencil } from 'lucide-react'
import AppDataGrid from '@/common/components/AppDataGrid'
import { editIconButtonClass } from '@/common/styles/button'
import type { ProductionRecordResponse } from '../types'

interface ProductionRecordDataGridProps {
  records: ProductionRecordResponse[]
  loading: boolean
  onEdit: (record: ProductionRecordResponse) => void
}

const actionCellClass = 'flex h-full w-full items-center justify-center gap-1'

const formatDatetime = (value: string | null) => {
  if (!value) return '-'

  const date = new Date(value)
  const parts = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return `${getPart('year')}. ${getPart('month')}. ${getPart('day')}. ${getPart('hour')}:${getPart('minute')}`
}

const ProductionRecordDataGrid = ({
  records,
  loading,
  onEdit,
}: ProductionRecordDataGridProps) => {
  const columns: GridColDef<ProductionRecordResponse>[] = [
    {
      field: 'processName',
      headerName: '공정명',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <span className="text-[var(--text-strong)]">{params.row.processName}</span>
      ),
    },
    {
      field: 'inputQty',
      headerName: '투입수량',
      width: 110,
      sortable: false,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <span className="text-[var(--text-base)]">
          {params.row.inputQty.toLocaleString()}
        </span>
      ),
    },
    {
      field: 'completedQty',
      headerName: '양품수량',
      width: 110,
      sortable: false,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <span className="font-medium text-[var(--success)]">
          {params.row.completedQty.toLocaleString()}
        </span>
      ),
    },
    {
      field: 'defectQty',
      headerName: '불량수량',
      width: 110,
      sortable: false,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <span
          className={
            params.row.defectQty > 0 ? 'font-medium text-[var(--danger)]' : 'text-[var(--text-muted)]'
          }
        >
          {params.row.defectQty.toLocaleString()}
        </span>
      ),
    },
    {
      field: 'startedAt',
      headerName: '시작일시',
      width: 160,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-sm text-[var(--text-muted)]">
          {formatDatetime(params.row.startedAt)}
        </span>
      ),
    },
    {
      field: 'endedAt',
      headerName: '종료일시',
      width: 160,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-sm text-[var(--text-muted)]">
          {formatDatetime(params.row.endedAt)}
        </span>
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
        <span className="text-sm text-[var(--text-muted)]">
          {formatDatetime(params.row.createdAt)}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 80,
      sortable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className={actionCellClass}>
          <button
            type="button"
            onClick={() => onEdit(params.row)}
            className={editIconButtonClass}
            title="수정"
          >
            <Pencil size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AppDataGrid<ProductionRecordResponse>
      rows={records}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      localeText={{ noRowsLabel: '등록된 생산실적이 없습니다.' }}
      sx={{ minHeight: 300 }}
    />
  )
}

export default ProductionRecordDataGrid
