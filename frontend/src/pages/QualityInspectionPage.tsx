import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import QualityInspectionDataGrid from '@/features/quality/inspection/components/QualityInspectionDataGrid'
import QualityInspectionFormModal from '@/features/quality/inspection/components/QualityInspectionFormModal'
import {
  useCreateQualityInspection,
  useDeleteQualityInspection,
  useQualityInspectionList,
  useUpdateQualityInspection,
} from '@/features/quality/inspection/hooks/useQualityInspectionQuery'
import type {
  QualityInspectionCreateRequest,
  QualityInspectionResponse,
  QualityInspectionStatus,
  QualityInspectionUpdateRequest,
} from '@/features/quality/inspection/types'
import {
  QualityInspectionResult,
  QualityInspectionStatus as InspectionStatus,
} from '@/features/quality/inspection/types'

type StatusFilter = QualityInspectionStatus | 'ALL'

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: InspectionStatus.WAITING, label: '대기' },
  { value: InspectionStatus.IN_PROGRESS, label: '검사중' },
  { value: InspectionStatus.COMPLETED, label: '완료' },
]

const filterButtonBaseClass =
  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors'

const QualityInspectionPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<QualityInspectionResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  const { showToast, showAlert } = useFeedback()
  const statusParam = statusFilter === 'ALL' ? undefined : statusFilter
  const {
    data: inspections = [],
    isLoading,
    isError,
  } = useQualityInspectionList(statusParam)

  const createInspection = useCreateQualityInspection()
  const updateInspection = useUpdateQualityInspection()
  const deleteInspection = useDeleteQualityInspection()

  const summary = useMemo(() => {
    const completed = inspections.filter((inspection) => inspection.status === InspectionStatus.COMPLETED)
    const passCount = inspections.filter((inspection) => inspection.result === QualityInspectionResult.PASS).length
    const defectQty = inspections.reduce((sum, inspection) => sum + inspection.defectQty, 0)

    return {
      total: inspections.length,
      completed: completed.length,
      passRate: inspections.length === 0 ? 0 : Math.round((passCount / inspections.length) * 100),
      defectQty,
    }
  }, [inspections])

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0)
  }

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value)
    setPage(0)
  }

  const handleOpenCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (inspection: QualityInspectionResponse) => {
    setEditTarget(inspection)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleSubmit = (
    data: QualityInspectionCreateRequest | QualityInspectionUpdateRequest,
  ) => {
    if (editTarget) {
      updateInspection.mutate(
        { id: editTarget.id, data: data as QualityInspectionUpdateRequest },
        {
          onSuccess: () => {
            showToast({ title: '품질검사를 수정했습니다.', variant: 'success' })
            handleClose()
          },
          onError: () => {
            showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' })
          },
        },
      )
      return
    }

    createInspection.mutate(data as QualityInspectionCreateRequest, {
      onSuccess: () => {
        showToast({ title: '품질검사를 등록했습니다.', variant: 'success' })
        handleClose()
      },
      onError: () => {
        showToast({ title: '등록 중 오류가 발생했습니다.', variant: 'error' })
      },
    })
  }

  const handleDelete = async (inspection: QualityInspectionResponse) => {
    const confirmed = await showAlert({
      title: '품질검사 삭제',
      message: `"${inspection.inspectionNo}" 품질검사를 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteInspection.mutate(inspection.id, {
      onSuccess: () => {
        showToast({ title: '품질검사를 삭제했습니다.', variant: 'success' })
      },
      onError: () => {
        showToast({ title: '삭제 중 오류가 발생했습니다.', variant: 'error' })
      },
    })
  }

  const isMutating = createInspection.isPending || updateInspection.isPending

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="품질검사"
        description="작업지시, 품목, 공정 기준의 검사 결과와 판정을 관리합니다."
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className={pagePrimaryActionButtonClass}
          >
            <Plus size={16} />
            검사 등록
          </button>
        }
      />

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs text-[var(--text-muted)]">검사 건수</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text-strong)]">
            {summary.total.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs text-[var(--text-muted)]">완료</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text-strong)]">
            {summary.completed.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs text-[var(--text-muted)]">합격률</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text-strong)]">
            {summary.passRate}%
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs text-[var(--text-muted)]">불량수량</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text-strong)]">
            {summary.defectQty.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const active = statusFilter === filter.value
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleStatusFilterChange(filter.value)}
              className={`${filterButtonBaseClass} ${
                active
                  ? 'bg-[var(--primary)] text-[var(--text-inverse)]'
                  : 'bg-[var(--surface)] text-[var(--text-base)] hover:bg-[var(--surface-alt)]'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {isError && (
        <InlineAlert>품질검사 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      <QualityInspectionDataGrid
        inspections={inspections}
        loading={isLoading}
        currentPage={page}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <QualityInspectionFormModal
        key={`${modalOpen ? 'open' : 'closed'}-${editTarget?.id ?? 'create'}`}
        open={modalOpen}
        editTarget={editTarget}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={isMutating}
      />
    </div>
  )
}

export default QualityInspectionPage
