import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import AppTextField from '@/common/components/AppTextField'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import WorkerDataGrid from '@/features/operation/worker/components/WorkerDataGrid'
import WorkerFormModal from '@/features/operation/worker/components/WorkerFormModal'
import WorkerResignModal from '@/features/operation/worker/components/WorkerResignModal'
import {
  useCreateWorker,
  useDeleteWorker,
  useResignWorker,
  useUpdateWorker,
  useWorkerList,
} from '@/features/operation/worker/hooks/useWorkerQuery'
import { WorkerStatus } from '@/features/operation/worker/types'
import type {
  WorkerCreateRequest,
  WorkerResponse,
  WorkerResignRequest,
  WorkerStatus as WorkerStatusType,
  WorkerUpdateRequest,
} from '@/features/operation/worker/types'

type WorkerStatusFilter = 'ALL' | WorkerStatusType

const statusFilterOptions: Array<{ value: WorkerStatusFilter; label: string }> = [
  { value: 'ALL', label: '전체 상태' },
  { value: WorkerStatus.ACTIVE, label: '재직' },
  { value: WorkerStatus.ON_LEAVE, label: '휴직' },
  { value: WorkerStatus.RESIGNED, label: '퇴사' },
]

const normalizeSearch = (value: string) => value.trim().toLowerCase()

const WorkerManagementPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [resignModalOpen, setResignModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<WorkerResponse | null>(null)
  const [resignTarget, setResignTarget] = useState<WorkerResponse | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkerStatusFilter>('ALL')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const { data: workerList = [], isLoading, isError } = useWorkerList()

  const createWorker = useCreateWorker()
  const updateWorker = useUpdateWorker()
  const resignWorker = useResignWorker()
  const deleteWorker = useDeleteWorker()

  const filteredWorkers = useMemo(() => {
    const keyword = normalizeSearch(searchText)

    return workerList.filter((worker) => {
      const matchesStatus = statusFilter === 'ALL' || worker.status === statusFilter
      if (!matchesStatus) return false

      if (!keyword) return true

      const searchableText = [
        worker.workerCode,
        worker.workerName,
        worker.phone,
        worker.department,
        worker.jobTitle,
      ]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .toLowerCase()

      return searchableText.includes(keyword)
    })
  }, [searchText, statusFilter, workerList])

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0)
  }

  const handleSearchChange = (value: string) => {
    setSearchText(value)
    setPage(0)
  }

  const handleStatusFilterChange = (value: WorkerStatusFilter) => {
    setStatusFilter(value)
    setPage(0)
  }

  const handleOpenCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (worker: WorkerResponse) => {
    setEditTarget(worker)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleOpenResign = (worker: WorkerResponse) => {
    setResignTarget(worker)
    setResignModalOpen(true)
  }

  const handleCloseResign = () => {
    setResignModalOpen(false)
    setResignTarget(null)
  }

  const handleSubmit = (data: WorkerCreateRequest | WorkerUpdateRequest) => {
    if (editTarget) {
      updateWorker.mutate(
        { id: editTarget.id, data: data as WorkerUpdateRequest },
        {
          onSuccess: () => {
            showToast({ title: '작업자를 수정했습니다.', variant: 'success' })
            handleClose()
          },
          onError: (error) => {
            showToast({ title: getApiErrorMessage(error, '수정 중 오류가 발생했습니다.'), variant: 'error' })
          },
        },
      )
      return
    }

    createWorker.mutate(data as WorkerCreateRequest, {
      onSuccess: () => {
        showToast({ title: '작업자를 등록했습니다.', variant: 'success' })
        handleClose()
      },
      onError: (error) => {
        showToast({ title: getApiErrorMessage(error, '등록 중 오류가 발생했습니다.'), variant: 'error' })
      },
    })
  }

  const handleResignSubmit = (data: WorkerResignRequest) => {
    if (!resignTarget) return

    resignWorker.mutate(
      { id: resignTarget.id, data },
      {
        onSuccess: () => {
          showToast({ title: '작업자를 퇴사 처리했습니다.', variant: 'success' })
          handleCloseResign()
        },
        onError: (error) => {
          showToast({ title: getApiErrorMessage(error, '퇴사 처리 중 오류가 발생했습니다.'), variant: 'error' })
        },
      },
    )
  }

  const handleDelete = async (worker: WorkerResponse) => {
    const confirmed = await showAlert({
      title: '작업자 삭제',
      message: `"${worker.workerName}" 작업자를 삭제하시겠습니까? 작업자코드는 재사용되지 않습니다.`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteWorker.mutate(worker.id, {
      onSuccess: () => {
        showToast({ title: '작업자를 삭제했습니다.', variant: 'success' })
      },
      onError: (error) => {
        showToast({ title: getApiErrorMessage(error, '삭제 중 오류가 발생했습니다.'), variant: 'error' })
      },
    })
  }

  const isMutating = createWorker.isPending || updateWorker.isPending

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="작업자 관리"
        description="현장 작업자 정보를 관리합니다."
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className={pagePrimaryActionButtonClass}
          >
            <Plus size={16} />
            작업자 등록
          </button>
        }
      />

      {isError && (
        <InlineAlert>작업자 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_180px] lg:max-w-2xl">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <AppTextField
                value={searchText}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="작업자코드, 이름, 연락처 검색"
                slotProps={{ htmlInput: { className: 'pl-7' } }}
              />
            </div>
            <AppSelect
              value={statusFilter}
              onChange={(event) =>
                handleStatusFilterChange(event.target.value as WorkerStatusFilter)
              }
            >
              {statusFilterOptions.map((option) => (
                <AppMenuItem key={option.value} value={option.value}>
                  {option.label}
                </AppMenuItem>
              ))}
            </AppSelect>
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            총 <span className="font-semibold text-[var(--text-strong)]">{filteredWorkers.length}</span>
            명
          </div>
        </div>
      </section>

      <WorkerDataGrid
        workers={filteredWorkers}
        loading={isLoading}
        currentPage={page}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onResign={handleOpenResign}
        onDelete={handleDelete}
      />

      <WorkerFormModal
        key={`${modalOpen ? 'open' : 'closed'}-${editTarget?.id ?? 'create'}`}
        open={modalOpen}
        editTarget={editTarget}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={isMutating}
      />

      <WorkerResignModal
        key={`${resignModalOpen ? 'open' : 'closed'}-${resignTarget?.id ?? 'none'}`}
        open={resignModalOpen}
        target={resignTarget}
        onClose={handleCloseResign}
        onSubmit={handleResignSubmit}
        isLoading={resignWorker.isPending}
      />
    </div>
  )
}

export default WorkerManagementPage
