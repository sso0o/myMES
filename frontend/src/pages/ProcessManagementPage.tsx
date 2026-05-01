import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFeedback } from '@/common/hooks/useFeedback'
import ProcessTable from '@/features/master/process/components/ProcessTable'
import ProcessFormModal from '@/features/master/process/components/ProcessFormModal'
import {
  useCreateProcess,
  useDeleteProcess,
  useProcessList,
  useUpdateProcess,
} from '@/features/master/process/hooks/useProcessQuery'
import type {
  ProcessCreateRequest,
  ProcessResponse,
  ProcessUpdateRequest,
} from '@/features/master/process/types'

const ProcessManagementPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProcessResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const { data: processes = [], isLoading, isError } = useProcessList()

  const totalPages = Math.ceil(processes.length / size)
  const pagedProcesses = processes.slice(page * size, page * size + size)

  const createProcess = useCreateProcess()
  const updateProcess = useUpdateProcess()
  const deleteProcess = useDeleteProcess()

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0)
  }

  const handleOpenCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (process: ProcessResponse) => {
    setEditTarget(process)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleSubmit = (data: ProcessCreateRequest | ProcessUpdateRequest) => {
    if (editTarget) {
      updateProcess.mutate(
        { id: editTarget.id, data },
        {
          onSuccess: () => {
            showToast({ title: '공정을 수정했습니다.', variant: 'success' })
            handleClose()
          },
          onError: () => {
            showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' })
          },
        },
      )
      return
    }

    createProcess.mutate(data as ProcessCreateRequest, {
      onSuccess: () => {
        showToast({ title: '공정을 등록했습니다.', variant: 'success' })
        handleClose()
      },
      onError: () => {
        showToast({ title: '등록 중 오류가 발생했습니다.', variant: 'error' })
      },
    })
  }

  const handleDelete = async (process: ProcessResponse) => {
    const confirmed = await showAlert({
      title: '공정 삭제',
      message: `"${process.processName}" 공정을 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteProcess.mutate(process.id, {
      onSuccess: () => {
        showToast({ title: '공정을 삭제했습니다.', variant: 'success' })
      },
      onError: () => {
        showToast({ title: '삭제 중 오류가 발생했습니다.', variant: 'error' })
      },
    })
  }

  const isMutating = createProcess.isPending || updateProcess.isPending

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-strong)]">공정 관리</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            생산에 사용하는 공정을 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)]"
        >
          <Plus size={16} />
          공정 등록
        </button>
      </div>

      {isError && (
        <div className="rounded-lg border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          공정 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-sm text-[var(--text-muted)]">불러오는 중...</div>
      ) : (
        <ProcessTable
          processes={pagedProcesses}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          currentPage={page}
          totalPages={totalPages}
          totalItems={processes.length}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <ProcessFormModal
        open={modalOpen}
        editTarget={editTarget}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={isMutating}
      />
    </div>
  )
}

export default ProcessManagementPage
