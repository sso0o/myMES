import { useState } from 'react'
import { Plus } from 'lucide-react'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import EquipmentDataGrid from '@/features/prod-basic/equipment/components/EquipmentDataGrid'
import EquipmentFormModal from '@/features/prod-basic/equipment/components/EquipmentFormModal'
import {
  useCreateEquipment,
  useDeleteEquipment,
  useEquipmentList,
  useUpdateEquipment,
} from '@/features/prod-basic/equipment/hooks/useEquipmentQuery'
import type {
  EquipmentCreateRequest,
  EquipmentResponse,
  EquipmentUpdateRequest,
} from '@/features/prod-basic/equipment/types'

const EquipmentManagementPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EquipmentResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const { data: equipmentList = [], isLoading, isError } = useEquipmentList()

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
      <PageHeader
        title="설비 관리"
        description="생산에 사용하는 설비를 관리합니다."
        actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className={pagePrimaryActionButtonClass}
        >
          <Plus size={16} />
          설비 등록
        </button>
        }
      />

      {isError && (
        <InlineAlert>설비 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      <EquipmentDataGrid
        equipment={equipmentList}
        loading={isLoading}
        currentPage={page}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <EquipmentFormModal
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

export default EquipmentManagementPage
