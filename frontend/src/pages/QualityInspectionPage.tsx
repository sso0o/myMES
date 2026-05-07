import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Plus, ThumbsUp } from 'lucide-react'
import { KpiCard } from '@/common/components/KpiCard'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import InspectionStatusTabs, {
  type InspectionStatusFilter,
} from '@/features/quality/inspection/components/InspectionStatusTabs'
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
  QualityInspectionUpdateRequest,
} from '@/features/quality/inspection/types'
import {
  QualityInspectionResult,
  QualityInspectionStatus,
} from '@/features/quality/inspection/types'

const QualityInspectionPage = () => {
  const [activeTab, setActiveTab] = useState<InspectionStatusFilter>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<QualityInspectionResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const statusParam = activeTab === 'ALL' ? undefined : activeTab
  const {
    data: inspections = [],
    isLoading,
    isError,
  } = useQualityInspectionList(statusParam)

  const createInspection = useCreateQualityInspection()
  const updateInspection = useUpdateQualityInspection()
  const deleteInspection = useDeleteQualityInspection()

  const summary = useMemo(() => {
    const completed = inspections.filter((i) => i.status === QualityInspectionStatus.COMPLETED)
    const passCount = inspections.filter((i) => i.result === QualityInspectionResult.PASS).length
    const defectQty = inspections.reduce((sum, i) => sum + i.defectQty, 0)

    return {
      total: inspections.length,
      completed: completed.length,
      passRate: inspections.length === 0 ? 0 : Math.round((passCount / inspections.length) * 100),
      defectQty,
    }
  }, [inspections])

  const counts = useMemo(() => {
    const result: Partial<Record<InspectionStatusFilter, number>> = { ALL: inspections.length }
    for (const status of Object.values(QualityInspectionStatus)) {
      result[status] = inspections.filter((i) => i.status === status).length
    }
    return result
  }, [inspections])

  const handleTabChange = (tab: InspectionStatusFilter) => {
    setActiveTab(tab)
    setPage(0)
  }

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
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

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="검사 건수"
          value={summary.total.toLocaleString()}
          unit="건"
          icon={<ClipboardList size={20} />}
          color="blue"
        />
        <KpiCard
          title="완료"
          value={summary.completed.toLocaleString()}
          unit="건"
          icon={<CheckCircle2 size={20} />}
          color="green"
          description={`미완료 ${summary.total - summary.completed}건`}
        />
        <KpiCard
          title="불량수량"
          value={summary.defectQty.toLocaleString()}
          unit="EA"
          icon={<AlertTriangle size={20} />}
          color="red"
        />
        <KpiCard
          title="합격률"
          value={summary.passRate}
          unit="%"
          icon={<ThumbsUp size={20} />}
          color="green"
        />
      </div>

      {isError && (
        <InlineAlert>품질검사 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      <InspectionStatusTabs activeTab={activeTab} counts={counts} onChange={handleTabChange} />

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
