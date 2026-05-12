import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Wrench } from 'lucide-react'
import { KpiCard } from '@/common/components/KpiCard'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { getApiErrorMessage } from '@/common/utils/apiError'
import DefectActionModal from '@/features/quality/defect/components/DefectActionModal'
import DefectActionStatusTabs, {
  type DefectActionFilter,
} from '@/features/quality/defect/components/DefectActionStatusTabs'
import DefectDataGrid from '@/features/quality/defect/components/DefectDataGrid'
import {
  useDefectList,
  useUpdateDefectAction,
} from '@/features/quality/defect/hooks/useDefectQuery'
import type { DefectActionUpdateRequest, DefectResponse } from '@/features/quality/defect/types'
import { DefectAction } from '@/features/quality/defect/types'

const DefectManagementPage = () => {
  const [activeTab, setActiveTab] = useState<DefectActionFilter>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDefect, setSelectedDefect] = useState<DefectResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast } = useFeedback()
  const { data: defects = [], isLoading, isError } = useDefectList()
  const updateDefectAction = useUpdateDefectAction()

  const filteredDefects = useMemo(() => {
    if (activeTab === 'ALL') return defects
    return defects.filter((d) => d.actionStatus === activeTab)
  }, [defects, activeTab])

  const summary = useMemo(() => {
    const waiting = defects.filter((d) => d.actionStatus === DefectAction.WAITING).length
    const inProgress = defects.filter(
      (d) => d.actionStatus === DefectAction.REWORK || d.actionStatus === DefectAction.SCRAP,
    ).length
    const completed = defects.filter((d) => d.actionStatus === DefectAction.COMPLETED).length
    const totalQty = defects.reduce((sum, d) => sum + d.qty, 0)

    return { total: defects.length, waiting, inProgress, completed, totalQty }
  }, [defects])

  const counts = useMemo(() => {
    const result: Partial<Record<DefectActionFilter, number>> = { ALL: defects.length }
    for (const action of Object.values(DefectAction)) {
      result[action] = defects.filter((d) => d.actionStatus === action).length
    }
    return result
  }, [defects])

  const handleTabChange = (tab: DefectActionFilter) => {
    setActiveTab(tab)
    setPage(0)
  }

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0)
  }

  const handleOpenAction = (defect: DefectResponse) => {
    setSelectedDefect(defect)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setSelectedDefect(null)
  }

  const handleSubmit = (data: DefectActionUpdateRequest) => {
    if (!selectedDefect) return

    updateDefectAction.mutate(
      { id: selectedDefect.id, data },
      {
        onSuccess: () => {
          showToast({ title: '불량 조치를 저장했습니다.', variant: 'success' })
          handleClose()
        },
        onError: (error) => {
          showToast({
            title: getApiErrorMessage(error, '저장 중 오류가 발생했습니다.'),
            variant: 'error',
          })
        },
      },
    )
  }

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="불량관리"
        description="검사와 생산 과정에서 발생한 불량, 원인, 조치 상태를 관리합니다."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="전체 불량"
          value={summary.total.toLocaleString()}
          unit="건"
          icon={<ClipboardList size={20} />}
          color="blue"
          description={`누적 불량수량 ${summary.totalQty.toLocaleString()} EA`}
        />
        <KpiCard
          title="대기"
          value={summary.waiting.toLocaleString()}
          unit="건"
          icon={<AlertTriangle size={20} />}
          color="red"
        />
        <KpiCard
          title="처리중"
          value={summary.inProgress.toLocaleString()}
          unit="건"
          icon={<Wrench size={20} />}
          color="blue"
          description="재작업 + 폐기"
        />
        <KpiCard
          title="완료"
          value={summary.completed.toLocaleString()}
          unit="건"
          icon={<CheckCircle2 size={20} />}
          color="green"
        />
      </div>

      {isError && (
        <InlineAlert>불량 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      <DefectActionStatusTabs activeTab={activeTab} counts={counts} onChange={handleTabChange} />

      <DefectDataGrid
        defects={filteredDefects}
        loading={isLoading}
        currentPage={page}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onUpdateAction={handleOpenAction}
      />

      <DefectActionModal
        open={modalOpen}
        defect={selectedDefect}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={updateDefectAction.isPending}
      />
    </div>
  )
}

export default DefectManagementPage
