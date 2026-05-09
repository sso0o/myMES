import { useState } from 'react'
import { Plus } from 'lucide-react'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import InspectionItemDataGrid from '@/features/quality/inspection-item/components/InspectionItemDataGrid'
import InspectionItemFormModal from '@/features/quality/inspection-item/components/InspectionItemFormModal'
import {
  useCreateInspectionItem,
  useDeleteInspectionItem,
  useInspectionItemList,
  useUpdateInspectionItem,
} from '@/features/quality/inspection-item/hooks/useInspectionItemQuery'
import type {
  InspectionItemCreateRequest,
  InspectionItemResponse,
  InspectionItemUpdateRequest,
} from '@/features/quality/inspection-item/types'

const InspectionItemManagementPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<InspectionItemResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const { data: inspectionItems = [], isLoading, isError } = useInspectionItemList()

  const createInspectionItem = useCreateInspectionItem()
  const updateInspectionItem = useUpdateInspectionItem()
  const deleteInspectionItem = useDeleteInspectionItem()

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0)
  }

  const handleOpenCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (inspectionItem: InspectionItemResponse) => {
    setEditTarget(inspectionItem)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleSubmit = (data: InspectionItemCreateRequest | InspectionItemUpdateRequest) => {
    if (editTarget) {
      updateInspectionItem.mutate(
        { id: editTarget.id, data: data as InspectionItemUpdateRequest },
        {
          onSuccess: () => {
            showToast({ title: '검사항목을 수정했습니다.', variant: 'success' })
            handleClose()
          },
          onError: (error) => {
            showToast({
              title: getApiErrorMessage(error, '수정 중 오류가 발생했습니다.'),
              variant: 'error',
            })
          },
        },
      )
      return
    }

    createInspectionItem.mutate(data as InspectionItemCreateRequest, {
      onSuccess: () => {
        showToast({ title: '검사항목을 등록했습니다.', variant: 'success' })
        handleClose()
      },
      onError: (error) => {
        showToast({
          title: getApiErrorMessage(error, '등록 중 오류가 발생했습니다.'),
          variant: 'error',
        })
      },
    })
  }

  const handleDelete = async (inspectionItem: InspectionItemResponse) => {
    const confirmed = await showAlert({
      title: '검사항목 삭제',
      message: `"${inspectionItem.inspectionItemName}" 검사항목을 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteInspectionItem.mutate(inspectionItem.id, {
      onSuccess: () => {
        showToast({ title: '검사항목을 삭제했습니다.', variant: 'success' })
      },
      onError: (error) => {
        showToast({
          title: getApiErrorMessage(error, '삭제 중 오류가 발생했습니다.'),
          variant: 'error',
        })
      },
    })
  }

  const isMutating = createInspectionItem.isPending || updateInspectionItem.isPending

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="검사항목 마스터"
        description="품질검사에 사용할 검사항목의 분류, 측정방식, 기본 단위를 관리합니다."
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className={pagePrimaryActionButtonClass}
          >
            <Plus size={16} />
            검사항목 등록
          </button>
        }
      />

      {isError && (
        <InlineAlert>검사항목 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      <InspectionItemDataGrid
        inspectionItems={inspectionItems}
        loading={isLoading}
        currentPage={page}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <InspectionItemFormModal
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

export default InspectionItemManagementPage
