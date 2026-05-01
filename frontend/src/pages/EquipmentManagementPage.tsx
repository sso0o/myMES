import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFeedback } from '@/common/hooks/useFeedback'
import EquipmentTable from '@/features/master/equipment/components/EquipmentTable'
import EquipmentFormModal from '@/features/master/equipment/components/EquipmentFormModal'
import {
  useCreateEquipment,
  useDeleteEquipment,
  useEquipmentList,
  useUpdateEquipment,
} from '@/features/master/equipment/hooks/useEquipmentQuery'
import type {
  EquipmentCreateRequest,
  EquipmentResponse,
  EquipmentUpdateRequest,
} from '@/features/master/equipment/types'

const EquipmentManagementPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EquipmentResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const { data: equipmentList = [], isLoading, isError } = useEquipmentList()

  const totalPages = Math.ceil(equipmentList.length / size)
  const pagedEquipment = equipmentList.slice(page * size, page * size + size)

  const createEquipment = useCreateEquipment()
  const updateEquipment = useUpdateEquipment()
  const deleteEquipment = useDeleteEquipment()

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0)
  }

  const handleOpenCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (equipment: EquipmentResponse) => {
    setEditTarget(equipment)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleSubmit = (data: EquipmentCreateRequest | EquipmentUpdateRequest) => {
    if (editTarget) {
      updateEquipment.mutate(
        { id: editTarget.id, data },
        {
          onSuccess: () => {
            showToast({ title: '설비를 수정했습니다.', variant: 'success' })
            handleClose()
          },
          onError: () => {
            showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' })
          },
        },
      )
      return
    }

    createEquipment.mutate(data as EquipmentCreateRequest, {
      onSuccess: () => {
        showToast({ title: '설비를 등록했습니다.', variant: 'success' })
        handleClose()
      },
      onError: () => {
        showToast({ title: '등록 중 오류가 발생했습니다.', variant: 'error' })
      },
    })
  }

  const handleDelete = async (equipment: EquipmentResponse) => {
    const confirmed = await showAlert({
      title: '설비 삭제',
      message: `"${equipment.equipmentName}" 설비를 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteEquipment.mutate(equipment.id, {
      onSuccess: () => {
        showToast({ title: '설비를 삭제했습니다.', variant: 'success' })
      },
      onError: () => {
        showToast({ title: '삭제 중 오류가 발생했습니다.', variant: 'error' })
      },
    })
  }

  const isMutating = createEquipment.isPending || updateEquipment.isPending

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-strong)]">설비 관리</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            생산에 사용하는 설비를 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)]"
        >
          <Plus size={16} />
          설비 등록
        </button>
      </div>

      {isError && (
        <div className="rounded-lg border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          설비 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-sm text-[var(--text-muted)]">불러오는 중...</div>
      ) : (
        <EquipmentTable
          equipment={pagedEquipment}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          currentPage={page}
          totalPages={totalPages}
          totalItems={equipmentList.length}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <EquipmentFormModal
        open={modalOpen}
        editTarget={editTarget}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={isMutating}
      />
    </div>
  )
}

export default EquipmentManagementPage
