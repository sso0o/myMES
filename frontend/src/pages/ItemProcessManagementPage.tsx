import { useState } from 'react'
import { Copy, Plus } from 'lucide-react'
import EmptyState from '@/common/components/EmptyState'
import PageHeader from '@/common/components/PageHeader'
import { primaryActionButtonClass } from '@/common/styles/button'
import { useFeedback } from '@/common/hooks/useFeedback'
import { useItemList } from '@/features/master/item/hooks/useItemQuery'
import type { ItemResponse } from '@/features/master/item/types'
import { useProcessList } from '@/features/prod-basic/process/hooks/useProcessQuery'
import {
  useItemProcessList,
  useCreateItemProcess,
  useUpdateItemProcess,
  useDeleteItemProcess,
  useBulkCopyItemProcess,
} from '@/features/prod-basic/item-process/hooks/useItemProcessQuery'
import type { ItemProcessResponse } from '@/features/prod-basic/item-process/types'
import { CopyMode } from '@/features/prod-basic/item-process/types'
import ItemProcessDataGrid, {
  type ItemProcessGridRow,
} from '@/features/prod-basic/item-process/components/ItemProcessDataGrid'
import ItemProcessBulkCopyModal from '@/features/prod-basic/item-process/components/ItemProcessBulkCopyModal'
import ItemProcessItemDataGrid from '@/features/prod-basic/item-process/components/ItemProcessItemDataGrid'

const ItemProcessManagementPage = () => {
  const [selectedItem, setSelectedItem] = useState<ItemResponse | null>(null)
  const [addingRow, setAddingRow] = useState(false)
  const [initialSequence, setInitialSequence] = useState(1)
  const [bulkCopyOpen, setBulkCopyOpen] = useState(false)

  const { showToast, showAlert } = useFeedback()

  const { data: itemResponse, isLoading: itemsLoading } = useItemList(0, 100)
  const items = (itemResponse?.data ?? []).filter(
    (item) => item.itemTypeName === '완제품' || item.itemTypeName === '반제품',
  )

  const { data: processes = [] } = useProcessList()

  const { data: itemProcesses = [], isLoading: processesLoading } = useItemProcessList(
    selectedItem?.id ?? null,
  )

  const createItemProcess = useCreateItemProcess()
  const updateItemProcess = useUpdateItemProcess()
  const deleteItemProcess = useDeleteItemProcess()
  const bulkCopyItemProcess = useBulkCopyItemProcess()

  const handleSelectItem = (item: ItemResponse) => {
    setSelectedItem(item)
    setAddingRow(false)
  }

  const handleStartAdd = () => {
    const nextSequence =
      itemProcesses.length === 0
        ? 1
        : Math.max(...itemProcesses.map((ip) => ip.sequence)) + 1
    setInitialSequence(nextSequence)
    setAddingRow(true)
  }

  const handleCancelAdd = () => {
    setAddingRow(false)
  }

  const handleProcessRowUpdate = async (
    newRow: ItemProcessGridRow,
  ): Promise<ItemProcessGridRow> => {
    if (!selectedItem) throw new Error('품목을 선택해주세요.')

    const processId = Number(newRow.processId)
    const sequence = Number(newRow.sequence)

    if (!processId || isNaN(processId)) {
      showToast({ title: '공정을 선택해주세요.', variant: 'error' })
      throw new Error('공정을 선택해주세요.')
    }
    if (!sequence || isNaN(sequence) || sequence < 1) {
      showToast({ title: '순서를 올바르게 입력해주세요.', variant: 'error' })
      throw new Error('순서를 올바르게 입력해주세요.')
    }

    if (newRow.isNew) {
      try {
        await createItemProcess.mutateAsync({
          itemId: selectedItem.id,
          processId,
          sequence,
        })
        showToast({ title: '공정을 추가했습니다.', variant: 'success' })
        setAddingRow(false)
        return { ...newRow, isNew: false }
      } catch {
        showToast({ title: '추가 중 오류가 발생했습니다.', variant: 'error' })
        throw new Error('추가 중 오류가 발생했습니다.')
      }
    }

    try {
      await updateItemProcess.mutateAsync({
        id: newRow.id,
        data: { processId, sequence },
        itemId: selectedItem.id,
      })
      showToast({ title: '공정을 수정했습니다.', variant: 'success' })
      return { ...newRow }
    } catch {
      showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' })
      throw new Error('수정 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (ip: ItemProcessResponse) => {
    if (!selectedItem) return
    const confirmed = await showAlert({
      title: '공정 삭제',
      message: `"${ip.processName}" 공정을 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return
    deleteItemProcess.mutate(
      { id: ip.id, itemId: selectedItem.id },
      {
        onSuccess: () => showToast({ title: '공정을 삭제했습니다.', variant: 'success' }),
        onError: () => showToast({ title: '삭제 중 오류가 발생했습니다.', variant: 'error' }),
      },
    )
  }

  const handleBulkCopy = async (targetItemIds: number[], mode: CopyMode) => {
    if (!selectedItem) return
    const confirmed = await showAlert({
      title: '공정 일괄 적용',
      message: `선택한 ${targetItemIds.length}개 품목에 현재 품목의 공정을 적용하시겠습니까?`,
      confirmText: '적용',
    })
    if (!confirmed) return
    await new Promise<void>((resolve, reject) => {
      bulkCopyItemProcess.mutate(
        { sourceItemId: selectedItem.id, targetItemIds, mode },
        {
          onSuccess: (data) => {
            showToast({
              title: `${data?.copiedCount ?? targetItemIds.length}개 품목에 공정을 적용했습니다.`,
              variant: 'success',
            })
            setBulkCopyOpen(false)
            resolve()
          },
          onError: () => {
            showToast({ title: '공정 적용 중 오류가 발생했습니다.', variant: 'error' })
            reject()
          },
        },
      )
    })
  }

  const canAdd = Boolean(selectedItem) && !addingRow
  const canBulkCopy = Boolean(selectedItem) && itemProcesses.length > 0

  return (
    <>
      <div className="min-w-0 max-w-full space-y-5 overflow-hidden p-6">
        <PageHeader title="품목별 공정 관리" description="품목에 적용되는 공정 순서를 관리합니다." />

        <div className="flex h-[calc(100vh-16rem)] min-w-0 gap-0">
          {/* 좌측: 품목 목록 */}
          <div className="flex w-[28rem] shrink-0 flex-col rounded-l-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex min-h-[52px] shrink-0 items-center border-b border-[var(--border)] px-4">
              <span className="text-sm font-semibold text-[var(--text-strong)]">품목 목록</span>
            </div>

            <div className="min-h-0 flex-1">
              <ItemProcessItemDataGrid
                items={items}
                loading={itemsLoading}
                selectedItemId={selectedItem?.id ?? null}
                onSelectItem={handleSelectItem}
              />
            </div>
          </div>

          {/* 우측: 공정 목록 */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-r-lg border border-l-0 border-[var(--border)] bg-[var(--surface)]">
            <div className="flex min-h-[52px] shrink-0 items-center justify-between border-b border-[var(--border)] px-5">
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-[var(--text-strong)]">
                  {selectedItem ? selectedItem.itemName : '공정 목록'}
                </span>
                {selectedItem && (
                  <span className="ml-2 font-mono text-xs text-[var(--text-muted)]">
                    {selectedItem.itemCode}
                  </span>
                )}
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBulkCopyOpen(true)}
                  disabled={!canBulkCopy}
                  className={primaryActionButtonClass}
                >
                  <Copy size={13} />
                  다른 품목에 적용
                </button>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  disabled={!canAdd}
                  className={primaryActionButtonClass}
                >
                  <Plus size={13} />
                  공정 추가
                </button>
              </div>
            </div>

            {!selectedItem ? (
              <EmptyState message="좌측에서 품목을 선택하세요." fill />
            ) : (
              <div className="min-h-0 flex-1">
                <ItemProcessDataGrid
                  key={selectedItem.id}
                  itemProcesses={itemProcesses}
                  processOptions={processes}
                  loading={processesLoading}
                  addingRow={addingRow}
                  initialSequence={initialSequence}
                  onCancelAdd={handleCancelAdd}
                  onProcessRowUpdate={handleProcessRowUpdate}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {bulkCopyOpen && selectedItem && (
        <ItemProcessBulkCopyModal
          sourceItem={selectedItem}
          sourceProcesses={itemProcesses}
          allItems={items}
          onConfirm={handleBulkCopy}
          onClose={() => setBulkCopyOpen(false)}
          isLoading={bulkCopyItemProcess.isPending}
        />
      )}
    </>
  )
}

export default ItemProcessManagementPage
