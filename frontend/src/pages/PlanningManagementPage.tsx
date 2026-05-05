import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import BulkActionBar from '@/features/prod-management/planning/components/BulkActionBar'
import BulkActionDialog from '@/features/prod-management/planning/components/BulkActionDialog'
import PlanningDataGrid from '@/features/prod-management/planning/components/PlanningDataGrid'
import PlanningFormModal from '@/features/prod-management/planning/components/PlanningFormModal'
import PlanStatusChangeDialog from '@/features/prod-management/planning/components/PlanStatusChangeDialog'
import PlanStatusTabs, {
  PLAN_STATUS_TABS,
  type PlanStatusFilter,
} from '@/features/prod-management/planning/components/PlanStatusTabs'
import {
  useBulkConfirmPlans,
  useBulkReleasePlans,
  useChangePlanStatus,
  useCreatePlan,
  useDeletePlan,
  usePlanningList,
  useUpdatePlan,
} from '@/features/prod-management/planning/hooks/usePlanningQuery'
import type { PlanningFormValues } from '@/features/prod-management/planning/schemas/planningSchema'
import { PlanStatus, type ProductionPlanResponse } from '@/features/prod-management/planning/types'

interface StatusChangeTarget {
  plan: ProductionPlanResponse
  status: PlanStatus
}

const PlanningManagementPage = () => {
  const [activeTab, setActiveTab] = useState<PlanStatusFilter>('ALL')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProductionPlanResponse | null>(null)
  const [statusChangeTarget, setStatusChangeTarget] = useState<StatusChangeTarget | null>(null)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)

  const { showToast, showAlert } = useFeedback()

  const statusParam = activeTab === 'ALL' ? undefined : activeTab
  const { data: plans = [], isLoading, isError } = usePlanningList(statusParam)

  const counts = useMemo(() => {
    const all = plans.length
    const result: Partial<Record<PlanStatusFilter, number>> = { ALL: all }
    for (const status of Object.values(PlanStatus)) {
      result[status] = plans.filter((p) => p.status === status).length
    }
    return result
  }, [plans])

  const activeBulkAction = useMemo(
    () => PLAN_STATUS_TABS.find((t) => t.value === activeTab)?.bulkAction ?? null,
    [activeTab],
  )

  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()
  const changePlanStatus = useChangePlanStatus()
  const bulkConfirm = useBulkConfirmPlans()
  const bulkRelease = useBulkReleasePlans()

  const handleTabChange = (tab: PlanStatusFilter) => {
    setActiveTab(tab)
    setSelectedIds([])
  }

  const handleOpenCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (plan: ProductionPlanResponse) => {
    setEditTarget(plan)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleSubmit = (data: PlanningFormValues) => {
    if (editTarget) {
      updatePlan.mutate(
        { id: editTarget.id, data },
        {
          onSuccess: () => {
            showToast({ title: '생산계획을 수정했습니다.', variant: 'success' })
            handleCloseModal()
          },
          onError: () => {
            showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' })
          },
        },
      )
      return
    }

    createPlan.mutate(data, {
      onSuccess: () => {
        showToast({ title: '생산계획을 등록했습니다.', variant: 'success' })
        handleCloseModal()
      },
      onError: () => {
        showToast({ title: '등록 중 오류가 발생했습니다.', variant: 'error' })
      },
    })
  }

  const handleDelete = async (plan: ProductionPlanResponse) => {
    const confirmed = await showAlert({
      title: '생산계획 삭제',
      message: `"${plan.planNo}" 계획을 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deletePlan.mutate(plan.id, {
      onSuccess: () => showToast({ title: '생산계획을 삭제했습니다.', variant: 'success' }),
      onError: () => showToast({ title: '삭제 중 오류가 발생했습니다.', variant: 'error' }),
    })
  }

  const handleChangeStatus = (plan: ProductionPlanResponse, status: PlanStatus) => {
    setStatusChangeTarget({ plan, status })
  }

  const handleConfirmStatusChange = () => {
    if (!statusChangeTarget) return
    changePlanStatus.mutate(
      { id: statusChangeTarget.plan.id, status: statusChangeTarget.status },
      {
        onSuccess: () => {
          showToast({ title: '상태를 변경했습니다.', variant: 'success' })
          setStatusChangeTarget(null)
        },
        onError: () => {
          showToast({ title: '상태 변경 중 오류가 발생했습니다.', variant: 'error' })
          setStatusChangeTarget(null)
        },
      },
    )
  }

  const handleBulkExecute = () => {
    setBulkDialogOpen(true)
  }

  const handleBulkConfirm = () => {
    if (!activeBulkAction) return

    if (activeBulkAction === 'confirm') {
      bulkConfirm.mutate(selectedIds, {
        onSuccess: (result) => {
          showToast({
            title: `${result?.confirmedCount ?? selectedIds.length}개 계획을 확정했습니다.`,
            variant: 'success',
          })
          setSelectedIds([])
          setBulkDialogOpen(false)
        },
        onError: () => {
          showToast({ title: '일괄 확정 중 오류가 발생했습니다.', variant: 'error' })
          setBulkDialogOpen(false)
        },
      })
    } else {
      bulkRelease.mutate(selectedIds, {
        onSuccess: (result) => {
          showToast({
            title: `${result?.releasedCount ?? selectedIds.length}개 계획의 작업지시를 발행했습니다.`,
            variant: 'success',
          })
          setSelectedIds([])
          setBulkDialogOpen(false)
        },
        onError: () => {
          showToast({ title: '일괄 발행 중 오류가 발생했습니다.', variant: 'error' })
          setBulkDialogOpen(false)
        },
      })
    }
  }

  const isMutating = createPlan.isPending || updatePlan.isPending
  const isBulkMutating = bulkConfirm.isPending || bulkRelease.isPending

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="생산계획"
        description="생산 계획을 등록하고 작업지시로 발행합니다."
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className={pagePrimaryActionButtonClass}
          >
            <Plus size={16} />
            생산계획 등록
          </button>
        }
      />

      {isError && (
        <InlineAlert>생산계획 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      <PlanStatusTabs activeTab={activeTab} counts={counts} onChange={handleTabChange} />

      {activeBulkAction && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          action={activeBulkAction}
          isLoading={isBulkMutating}
          onExecute={handleBulkExecute}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {/* TODO: 탭 이동 시 카운트되는 숫자 확인 필요 */}
      <PlanningDataGrid
        plans={plans}
        loading={isLoading}
        activeTab={activeTab}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onChangeStatus={handleChangeStatus}
      />

      <PlanningFormModal
        key={`${modalOpen ? 'open' : 'closed'}-${editTarget?.id ?? 'create'}`}
        open={modalOpen}
        editTarget={editTarget}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={isMutating}
      />

      {statusChangeTarget && (
        <PlanStatusChangeDialog
          plan={statusChangeTarget.plan}
          targetStatus={statusChangeTarget.status}
          isLoading={changePlanStatus.isPending}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setStatusChangeTarget(null)}
        />
      )}

      {bulkDialogOpen && activeBulkAction && (
        <BulkActionDialog
          action={activeBulkAction}
          selectedCount={selectedIds.length}
          isLoading={isBulkMutating}
          onConfirm={handleBulkConfirm}
          onCancel={() => setBulkDialogOpen(false)}
        />
      )}
    </div>
  )
}

export default PlanningManagementPage
