import { useState } from 'react'
import { Copy, Plus } from 'lucide-react'
import { primaryActionButtonClass } from '@/common/styles/button'
import { useFeedback } from '@/common/hooks/useFeedback'
import { useItemList } from '@/features/master/item/hooks/useItemQuery'
import type { ItemResponse } from '@/features/master/item/types'
import BomBulkCopyModal from '@/features/prod-basic/bom/components/BomBulkCopyModal'
import BomDataGrid, { type BomInlineRow } from '@/features/prod-basic/bom/components/BomDataGrid'
import BomItemDataGrid from '@/features/prod-basic/bom/components/BomItemDataGrid'
import {
  useBomList,
  useBulkCopyBom,
  useCreateBom,
  useDeleteBom,
  useUpdateBom,
} from '@/features/prod-basic/bom/hooks/useBomQuery'
import type { BomResponse } from '@/features/prod-basic/bom/types'
import type { BomCopyMode } from '@/features/prod-basic/bom/types'

const emptyRow: BomInlineRow = { materialItemId: '', sequence: '', quantity: '', description: '' }

const BomManagementPage = () => {
  const [selectedItem, setSelectedItem] = useState<ItemResponse | null>(null)
  const [addingRow, setAddingRow] = useState(false)
  const [newRow, setNewRow] = useState<BomInlineRow>(emptyRow)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<BomInlineRow>(emptyRow)
  const [bulkCopyOpen, setBulkCopyOpen] = useState(false)

  const { showToast, showAlert } = useFeedback()

  const { data: itemResponse, isLoading: itemsLoading } = useItemList(0, 100)
  const items = (itemResponse?.data ?? []).filter(
    (item) => item.itemTypeName === '완제품' || item.itemTypeName === '반제품',
  )
  const materialOptions = (itemResponse?.data ?? []).filter((item) => item.id !== selectedItem?.id)

  const { data: boms = [], isLoading: bomsLoading } = useBomList(selectedItem?.id ?? null)

  const createBom = useCreateBom()
  const updateBom = useUpdateBom()
  const deleteBom = useDeleteBom()
  const bulkCopyBom = useBulkCopyBom()

  const resetInlineRows = () => {
    setAddingRow(false)
    setNewRow(emptyRow)
    setEditingId(null)
    setEditRow(emptyRow)
  }

  const handleSelectItem = (item: ItemResponse) => {
    setSelectedItem(item)
    resetInlineRows()
  }

  const handleStartAdd = () => {
    setEditingId(null)
    const nextSequence = boms.length === 0 ? 1 : Math.max(...boms.map((bom) => bom.sequence)) + 1
    setNewRow({ materialItemId: '', sequence: String(nextSequence), quantity: '1', description: '' })
    setAddingRow(true)
  }

  const handleCancelAdd = () => {
    setAddingRow(false)
    setNewRow(emptyRow)
  }

  const parseRow = (row: BomInlineRow) => {
    const materialItemId = parseInt(row.materialItemId, 10)
    const sequence = parseInt(row.sequence, 10)
    const quantity = Number(row.quantity)
    return { materialItemId, sequence, quantity }
  }

  const handleSaveAdd = () => {
    if (!selectedItem) return
    const { materialItemId, sequence, quantity } = parseRow(newRow)
    if (isNaN(materialItemId) || isNaN(sequence) || sequence < 1 || isNaN(quantity) || quantity <= 0) {
      showToast({ title: '자재, 순서, 소요수량을 올바르게 입력해주세요.', variant: 'error' })
      return
    }

    createBom.mutate(
      {
        parentItemId: selectedItem.id,
        materialItemId,
        sequence,
        quantity,
        description: newRow.description.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast({ title: '자재를 추가했습니다.', variant: 'success' })
          setAddingRow(false)
          setNewRow(emptyRow)
        },
        onError: () => showToast({ title: '추가 중 오류가 발생했습니다.', variant: 'error' }),
      },
    )
  }

  const handleStartEdit = (bom: BomResponse) => {
    setAddingRow(false)
    setEditingId(bom.id)
    setEditRow({
      materialItemId: String(bom.materialItemId),
      sequence: String(bom.sequence),
      quantity: String(bom.quantity),
      description: bom.description ?? '',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRow(emptyRow)
  }

  const handleSaveEdit = (bom: BomResponse) => {
    if (!selectedItem) return
    const { materialItemId, sequence, quantity } = parseRow(editRow)
    if (isNaN(materialItemId) || isNaN(sequence) || sequence < 1 || isNaN(quantity) || quantity <= 0) {
      showToast({ title: '자재, 순서, 소요수량을 올바르게 입력해주세요.', variant: 'error' })
      return
    }

    updateBom.mutate(
      {
        id: bom.id,
        parentItemId: selectedItem.id,
        data: {
          materialItemId,
          sequence,
          quantity,
          description: editRow.description.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          showToast({ title: '자재를 수정했습니다.', variant: 'success' })
          setEditingId(null)
        },
        onError: () => showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' }),
      },
    )
  }

  const handleDelete = async (bom: BomResponse) => {
    if (!selectedItem) return
    const confirmed = await showAlert({
      title: '자재 삭제',
      message: `"${bom.materialItemName}" 자재를 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteBom.mutate(
      { id: bom.id, parentItemId: selectedItem.id },
      {
        onSuccess: () => showToast({ title: '자재를 삭제했습니다.', variant: 'success' }),
        onError: () => showToast({ title: '삭제 중 오류가 발생했습니다.', variant: 'error' }),
      },
    )
  }

  const handleBulkCopy = async (targetItemIds: number[], mode: BomCopyMode) => {
    if (!selectedItem) return
    const confirmed = await showAlert({
      title: 'BOM 일괄 적용',
      message: `선택한 ${targetItemIds.length}개 품목에 현재 품목의 BOM을 적용하시겠습니까?`,
      confirmText: '적용',
    })
    if (!confirmed) return

    await new Promise<void>((resolve, reject) => {
      bulkCopyBom.mutate(
        { sourceItemId: selectedItem.id, targetItemIds, mode },
        {
          onSuccess: (data) => {
            showToast({
              title: `${data?.copiedCount ?? targetItemIds.length}개 품목에 BOM을 적용했습니다.`,
              variant: 'success',
            })
            setBulkCopyOpen(false)
            resolve()
          },
          onError: () => {
            showToast({ title: 'BOM 적용 중 오류가 발생했습니다.', variant: 'error' })
            reject()
          },
        },
      )
    })
  }

  const canAdd = Boolean(selectedItem) && !addingRow
  const canBulkCopy = Boolean(selectedItem) && boms.length > 0

  return (
    <>
    <div className="min-w-0 max-w-full space-y-5 overflow-hidden p-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-strong)]">BOM 관리</h1>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          제품 생산에 필요한 자재 구성을 관리합니다.
        </p>
      </div>

      <div className="flex h-[calc(100vh-16rem)] min-w-0 gap-0">
        <div className="flex w-[28rem] shrink-0 flex-col rounded-l-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex min-h-[52px] shrink-0 items-center border-b border-[var(--border)] px-4">
            <span className="text-sm font-semibold text-[var(--text-strong)]">품목 목록</span>
          </div>

          <div className="min-h-0 flex-1">
            <BomItemDataGrid
              items={items}
              loading={itemsLoading}
              selectedItemId={selectedItem?.id ?? null}
              onSelectItem={handleSelectItem}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-r-lg border border-l-0 border-[var(--border)] bg-[var(--surface)]">
          <div className="flex min-h-[52px] shrink-0 items-center justify-between border-b border-[var(--border)] px-5">
            <div className="min-w-0 flex-1">
              <span className="text-sm font-semibold text-[var(--text-strong)]">
                {selectedItem ? selectedItem.itemName : 'BOM 구성'}
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
                자재 추가
              </button>
            </div>
          </div>

          {!selectedItem ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
              좌측에서 품목을 선택하세요.
            </div>
          ) : (
            <div className="min-h-0 flex-1">
              <BomDataGrid
                boms={boms}
                materialOptions={materialOptions}
                loading={bomsLoading}
                addingRow={addingRow}
                editingId={editingId}
                newRow={newRow}
                editRow={editRow}
                isCreating={createBom.isPending}
                isUpdating={updateBom.isPending}
                onCancelAdd={handleCancelAdd}
                onChangeNewRow={setNewRow}
                onSaveAdd={handleSaveAdd}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onChangeEditRow={setEditRow}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>

      {bulkCopyOpen && selectedItem && (
        <BomBulkCopyModal
          sourceItem={selectedItem}
          sourceBoms={boms}
          allItems={items}
          onConfirm={handleBulkCopy}
          onClose={() => setBulkCopyOpen(false)}
          isLoading={bulkCopyBom.isPending}
        />
      )}
    </>
  )
}

export default BomManagementPage
