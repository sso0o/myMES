import { useState } from 'react'
import { Plus } from 'lucide-react'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { useFeedback } from '@/common/hooks/useFeedback'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import ItemDataGrid from '@/features/master/item/components/ItemDataGrid'
import ItemFormModal from '@/features/master/item/components/ItemFormModal'
import {
  useCreateItem,
  useDeleteItem,
  useItemList,
  useUpdateItem,
} from '@/features/master/item/hooks/useItemQuery'
import type {
  ItemCreateRequest,
  ItemResponse,
  ItemUpdateRequest,
} from '@/features/master/item/types'

const ItemManagementPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ItemResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const { data: response, isLoading, isError } = useItemList(page, size)
  const items = response?.data ?? []
  const pagination = response?.pagination

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0)
  }
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()

  const handleOpenCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (item: ItemResponse) => {
    setEditTarget(item)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleSubmit = async (data: ItemCreateRequest | ItemUpdateRequest) => {
    if (editTarget) {
      updateItem.mutate(
        { id: editTarget.id, data },
        {
          onSuccess: () => {
            showToast({ title: '품목을 수정했습니다.', variant: 'success' })
            handleClose()
          },
          onError: () => {
            showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' })
          },
        },
      )
      return
    }

    createItem.mutate(data as ItemCreateRequest, {
      onSuccess: () => {
        showToast({ title: '품목을 등록했습니다.', variant: 'success' })
        handleClose()
      },
      onError: () => {
        showToast({ title: '등록 중 오류가 발생했습니다.', variant: 'error' })
      },
    })
  }

  const handleDelete = async (item: ItemResponse) => {
    const confirmed = await showAlert({
      title: '품목 삭제',
      message: `"${item.itemName}" 품목을 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteItem.mutate(item.id, {
      onSuccess: () => {
        showToast({ title: '품목을 삭제했습니다.', variant: 'success' })
      },
      onError: () => {
        showToast({ title: '삭제 중 오류가 발생했습니다.', variant: 'error' })
      },
    })
  }

  const isMutating = createItem.isPending || updateItem.isPending

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="품목 관리"
        description="생산에 사용하는 품목을 관리합니다."
        actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className={pagePrimaryActionButtonClass}
        >
          <Plus size={16} />
          품목 등록
        </button>
        }
      />

      {isError && (
        <InlineAlert>품목 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      <ItemDataGrid
        items={items}
        loading={isLoading}
        currentPage={page}
        totalItems={pagination?.total ?? 0}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <ItemFormModal
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

export default ItemManagementPage
