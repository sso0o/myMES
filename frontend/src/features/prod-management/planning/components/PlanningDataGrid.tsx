import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import { CheckCheck, ClipboardList, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import AppDataGrid from '@/common/components/AppDataGrid'
import { deleteIconButtonClass, editIconButtonClass } from '@/common/styles/button'
import { PlanStatus, type ProductionPlanResponse } from '../types'
import type { PlanStatusFilter } from './PlanStatusTabs'
import PlanStatusBadge from './PlanStatusBadge'

interface PlanningDataGridProps {
  plans: ProductionPlanResponse[]
  loading: boolean
  activeTab: PlanStatusFilter
  selectedIds: number[]
  onSelectionChange: (ids: number[]) => void
  onEdit: (plan: ProductionPlanResponse) => void
  onDelete: (plan: ProductionPlanResponse) => void
  onChangeStatus: (plan: ProductionPlanResponse, status: PlanStatus) => void
}

const actionCellClass = 'flex h-full w-full items-center justify-center gap-1'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

const statusActionButtonClass =
  'flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors'

const SELECTABLE_STATUSES: PlanStatusFilter[] = [PlanStatus.DRAFT, PlanStatus.CONFIRMED]

const PlanningDataGrid = ({
  plans,
  loading,
  activeTab,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onChangeStatus,
}: PlanningDataGridProps) => {
  const isSelectable = SELECTABLE_STATUSES.includes(activeTab)

  const handleSelectionChange = (model: GridRowSelectionModel) => {
    onSelectionChange([...model.ids].map(Number))
  }

  const columns: GridColDef<ProductionPlanResponse>[] = [
    {
      field: 'planNo',
      headerName: '계획번호',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-sm text-[var(--text-base)]">{params.row.planNo}</span>
      ),
    },
    {
      field: 'itemCode',
      headerName: '품목코드',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <span className="font-mono text-sm text-[var(--text-muted)]">{params.row.itemCode}</span>
      ),
    },
    {
      field: 'itemName',
      headerName: '품목명',
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <span className="truncate text-[var(--text-strong)]">{params.row.itemName}</span>
      ),
    },
    {
      field: 'plannedQty',
      headerName: '계획수량',
      width: 110,
      sortable: false,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <span className="text-[var(--text-base)]">
          {params.row.plannedQty.toLocaleString()}
        </span>
      ),
    },
    {
      field: 'plannedDate',
      headerName: '생산예정일',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-[var(--text-base)]">{formatDate(params.row.plannedDate)}</span>
      ),
    },
    {
      field: 'status',
      headerName: '상태',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <PlanStatusBadge status={params.row.status} />,
    },
    {
      field: 'workOrderNo',
      headerName: '작업지시번호',
      width: 160,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="font-mono text-sm text-[var(--text-muted)]">
          {params.row.workOrderNo ?? '-'}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 260,
      sortable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const plan = params.row
        return (
          <div className={actionCellClass}>
            {plan.status === PlanStatus.DRAFT && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(plan)}
                  className={editIconButtonClass}
                  title="수정"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(plan)}
                  className={deleteIconButtonClass}
                  title="삭제"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus(plan, PlanStatus.CONFIRMED)}
                  className={`${statusActionButtonClass} bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--text-inverse)]`}
                >
                  <CheckCheck size={13} />
                  확정
                </button>
              </>
            )}
            {plan.status === PlanStatus.CONFIRMED && (
              <>
                <button
                  type="button"
                  onClick={() => onChangeStatus(plan, PlanStatus.DRAFT)}
                  className={`${statusActionButtonClass} bg-[var(--surface-alt)] text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text-base)]`}
                >
                  <RotateCcw size={13} />
                  초안
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus(plan, PlanStatus.RELEASED)}
                  className={`${statusActionButtonClass} bg-[var(--success-soft)] text-[var(--success)] hover:bg-[var(--success)] hover:text-[var(--text-inverse)]`}
                >
                  <ClipboardList size={13} />
                  작업지시 발행
                </button>
              </>
            )}
            {plan.status === PlanStatus.RELEASED && (
              <button
                type="button"
                onClick={() => onChangeStatus(plan, PlanStatus.CLOSED)}
                className={`${statusActionButtonClass} bg-[var(--surface-alt)] text-[var(--text-base)] hover:bg-[var(--border)]`}
              >
                <CheckCheck size={13} />
                완료 처리
              </button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <AppDataGrid<ProductionPlanResponse>
      rows={plans}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      checkboxSelection={isSelectable}
      isRowSelectable={() => isSelectable}
      rowSelectionModel={{ type: 'include', ids: new Set(selectedIds) }}
      onRowSelectionModelChange={handleSelectionChange}
      localeText={{ noRowsLabel: '등록된 생산계획이 없습니다.' }}
      sx={{ minHeight: 420 }}
    />
  )
}

export default PlanningDataGrid
