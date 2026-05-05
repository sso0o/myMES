import { useState } from 'react'
import { Plus } from 'lucide-react'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import ProcessDataGrid from '@/features/prod-basic/process/components/ProcessDataGrid'
import ProcessFormModal from '@/features/prod-basic/process/components/ProcessFormModal'
import {
  useCreateProcess,
  useDeleteProcess,
  useProcessList,
  useUpdateProcess,
} from '@/features/prod-basic/process/hooks/useProcessQuery'
import type {
  ProcessCreateRequest,
  ProcessResponse,
  ProcessUpdateRequest,
} from '@/features/prod-basic/process/types'

const ProcessManagementPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProcessResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const { data: processes = [], isLoading, isError } = useProcessList()

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
      <PageHeader
        title="공정 관리"
        description="생산에 사용하는 공정을 관리합니다."
        actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className={pagePrimaryActionButtonClass}
        >
          <Plus size={16} />
          공정 등록
        </button>
        }
      />

      {isError && (
        <InlineAlert>공정 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      <ProcessDataGrid
        processes={processes}
        loading={isLoading}
        currentPage={page}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <ProcessFormModal
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

export default ProcessManagementPage
