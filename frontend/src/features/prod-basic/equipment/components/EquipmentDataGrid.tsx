import { Pencil, Trash2 } from 'lucide-react'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import Badge from '@/common/components/Badge'
import { deleteIconButtonClass, editIconButtonClass } from '@/common/styles/button'
import type { EquipmentResponse } from '@/features/prod-basic/equipment/types'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const actionCellClass = 'flex h-full w-full items-center justify-center gap-2'

interface EquipmentDataGridProps {
  equipment: EquipmentResponse[]
  loading: boolean
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEdit: (equipment: EquipmentResponse) => void
  onDelete: (equipment: EquipmentResponse) => void
}

const formatDate = (value: string) => new Date(value).toLocaleDateString('ko-KR')
const formatOptionalDate = (value: string | null) => (value ? formatDate(value) : '-')

const EquipmentDataGrid = ({
  equipment,
  loading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: EquipmentDataGridProps) => {
  const columns: GridColDef<EquipmentResponse>[] = [
    {
      field: 'equipmentCode',
      headerName: '설비코드',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-[var(--text-base)]">{params.row.equipmentCode}</span>
      ),
    },
    {
      field: 'equipmentName',
      headerName: '설비명',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-strong)]">
          {params.row.equipmentName}
        </span>
      ),
    },
    {
      field: 'equipmentTypeName',
      headerName: '설비유형',
      width: 140,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        if (!params.row.equipmentTypeName) {
          return <span className="text-[var(--text-muted)]">-</span>
        }

        return <Badge shape="rounded">{params.row.equipmentTypeName}</Badge>
      },
    },
    {
      field: 'location',
      headerName: '위치',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-base)]">
          {params.row.location ?? '-'}
        </span>
      ),
    },
    {
      field: 'manufacturerModel',
      headerName: '제조사/모델',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const { manufacturer, modelName } = params.row

        if (!manufacturer && !modelName) {
          return <span className="text-[var(--text-muted)]">-</span>
        }

        return (
          <span className="truncate text-[var(--text-base)]">
            {manufacturer ?? '-'}
            {modelName ? (
              <span className="ml-1 text-[var(--text-muted)]">/ {modelName}</span>
            ) : null}
          </span>
        )
      },
    },
    {
      field: 'purchaseDate',
      headerName: '구입일',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-muted)]">
          {formatOptionalDate(params.row.purchaseDate)}
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
      width: 130,
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
    <AppDataGrid<EquipmentResponse>
      rows={equipment}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      paginationModel={{ page: currentPage, pageSize }}
      onPaginationModelChange={handlePaginationModelChange}
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      localeText={{ noRowsLabel: '등록된 설비가 없습니다.' }}
      sx={{
        minHeight: 420,
      }}
    />
  )
}

export default EquipmentDataGrid
