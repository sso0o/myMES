import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFeedback } from '@/common/hooks/useFeedback'
import ItemFormModal from '@/features/master/components/ItemFormModal'
import ItemTable from '@/features/master/components/ItemTable'
import {
  useCreateItem,
  useDeleteItem,
  useItemList,
  useUpdateItem,
} from '@/features/master/hooks/useItemQuery'
import type {
  ItemCreateRequest,
  ItemResponse,
  ItemUpdateRequest,
} from '@/features/master/types'

const ItemManagementPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ItemResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const { data: response, isLoading, isError } = useItemList(page, size)
  const items = response?.data ?? []
  const pagination = response?.pagination
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.size) : 0

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
    await showAlert({
      title: '품목 삭제',
      message: `"${item.itemName}" 품목을 삭제하시겠습니까?`,
      confirmText: '삭제',
    })

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-strong)]">품목 관리</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            생산에 사용하는 품목을 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)]"
        >
          <Plus size={16} />
          품목 등록
        </button>
      </div>

      {isError && (
        <div className="rounded-lg border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          품목 목록을 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-sm text-[var(--text-muted)]">
          불러오는 중...
        </div>
      ) : (
        <ItemTable
          items={items}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          currentPage={page}
          totalPages={totalPages}
          totalItems={pagination?.total ?? 0}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <ItemFormModal
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
