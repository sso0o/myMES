import { useState } from 'react'
import type { GridColDef } from '@mui/x-data-grid'
import { Plus } from 'lucide-react'
import AppDataGrid from '@/common/components/AppDataGrid'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import ProductionRecordDataGrid from '@/features/prod-management/production-record/components/ProductionRecordDataGrid'
import ProductionRecordFormModal from '@/features/prod-management/production-record/components/ProductionRecordFormModal'
import {
  useCreateProductionRecord,
  useProductionRecordList,
  useUpdateProductionRecord,
} from '@/features/prod-management/production-record/hooks/useProductionRecordQuery'
import type { ProductionRecordFormValues } from '@/features/prod-management/production-record/schemas/productionRecordSchema'
import type { ProductionRecordResponse } from '@/features/prod-management/production-record/types'
import { useWorkOrderList } from '@/features/prod-management/work-order/hooks/useWorkOrderQuery'
import { WorkOrderStatus, type WorkOrderResponse } from '@/features/prod-management/work-order/types'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

const formatNullableDate = (value: string | null) => (value ? formatDate(value) : '-')

const workOrderColumns: GridColDef<WorkOrderResponse>[] = [
  {
    field: 'workOrderNo',
    headerName: '작업지시번호',
    width: 180,
    sortable: false,
    renderCell: (params) => (
      <span className="font-mono text-sm text-[var(--text-base)]">{params.row.workOrderNo}</span>
    ),
  },
  {
    field: 'processName',
    headerName: '공정명',
    width: 140,
    sortable: false,
    renderCell: (params) => (
      <span className="text-[var(--text-base)]">{params.row.processName ?? '-'}</span>
    ),
  },
  {
    field: 'itemCode',
    headerName: '품목코드',
    width: 130,
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
    headerName: '지시수량',
    width: 100,
    sortable: false,
    headerAlign: 'right',
    align: 'right',
    renderCell: (params) => (
      <span className="text-[var(--text-base)]">{params.row.plannedQty.toLocaleString()}</span>
    ),
  },
  {
    field: 'workerName',
    headerName: '작업자',
    width: 110,
    sortable: false,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <span className="text-[var(--text-muted)]">{params.row.workerName ?? '-'}</span>
    ),
  },
  {
    field: 'productionDate',
    headerName: '생산일',
    width: 120,
    sortable: false,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <span className="text-[var(--text-base)]">{formatDate(params.row.productionDate)}</span>
    ),
  },
  {
    field: 'dueDate',
    headerName: '납기일',
    width: 120,
    sortable: false,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <span className="text-[var(--text-base)]">{formatNullableDate(params.row.dueDate)}</span>
    ),
  },
]

const ProductionRecordPage = () => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProductionRecordResponse | null>(null)

  const { showToast } = useFeedback()

  const { data: workOrders = [], isLoading: isWorkOrderLoading, isError: isWorkOrderError } =
    useWorkOrderList(WorkOrderStatus.IN_PROGRESS)

  const { data: records = [], isLoading: isRecordLoading } = useProductionRecordList(
    selectedWorkOrder?.id ?? null,
  )

  const createRecord = useCreateProductionRecord()
  const updateRecord = useUpdateProductionRecord()

  const handleSelectWorkOrder = (workOrder: WorkOrderResponse) => {
    if (selectedWorkOrder?.id === workOrder.id) return
    setSelectedWorkOrder(workOrder)
    setEditTarget(null)
  }

  const handleOpenCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (record: ProductionRecordResponse) => {
    setEditTarget(record)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleSubmit = (data: ProductionRecordFormValues) => {
    if (editTarget) {
      updateRecord.mutate(
        { id: editTarget.id, data },
        {
          onSuccess: () => {
            showToast({ title: '생산실적을 수정했습니다.', variant: 'success' })
            handleClose()
          },
          onError: () => showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' }),
        },
      )
      return
    }

    if (!selectedWorkOrder) return

    createRecord.mutate(
      { workOrderId: selectedWorkOrder.id, data },
      {
        onSuccess: () => {
          showToast({ title: '생산실적을 등록했습니다.', variant: 'success' })
          handleClose()
        },
        onError: () => showToast({ title: '등록 중 오류가 발생했습니다.', variant: 'error' }),
      },
    )
  }

  const isMutating = createRecord.isPending || updateRecord.isPending

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="생산 실적"
        description="진행 중인 작업지시를 선택하여 생산 실적을 등록합니다."
      />

      {isWorkOrderError && (
        <InlineAlert>작업지시 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-strong)]">
          작업지시 선택
          <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
            진행 중인 작업지시만 표시됩니다
          </span>
        </h2>
        <AppDataGrid<WorkOrderResponse>
          rows={workOrders}
          columns={workOrderColumns}
          loading={isWorkOrderLoading}
          getRowId={(row) => row.id}
          onRowClick={(params) => handleSelectWorkOrder(params.row)}
          rowSelectionModel={
            selectedWorkOrder
              ? { type: 'include', ids: new Set([selectedWorkOrder.id]) }
              : { type: 'include', ids: new Set() }
          }
          localeText={{ noRowsLabel: '진행 중인 작업지시가 없습니다.' }}
          sx={{ minHeight: 240, cursor: 'pointer' }}
        />
      </section>

      {selectedWorkOrder && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[var(--text-strong)]">생산 실적</h2>
              <span className="rounded-md bg-[var(--primary-soft)] px-2 py-0.5 font-mono text-xs text-[var(--primary)]">
                {selectedWorkOrder.workOrderNo}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {selectedWorkOrder.itemName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenCreate}
              className={pagePrimaryActionButtonClass}
            >
              <Plus size={16} />
              실적 등록
            </button>
          </div>

          <ProductionRecordDataGrid
            records={records}
            loading={isRecordLoading}
            onEdit={handleOpenEdit}
          />
        </section>
      )}

      {!selectedWorkOrder && workOrders.length > 0 && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--border)] py-12 text-sm text-[var(--text-muted)]">
          위 목록에서 작업지시를 선택하면 생산실적을 조회하고 등록할 수 있습니다.
        </div>
      )}

      <ProductionRecordFormModal
        open={modalOpen}
        editTarget={editTarget}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={isMutating}
      />
    </div>
  )
}

export default ProductionRecordPage
