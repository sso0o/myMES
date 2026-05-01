import { useState } from 'react'
import { Plus } from 'lucide-react'
import { primaryActionButtonClass } from '@/common/styles/button'
import { useFeedback } from '@/common/hooks/useFeedback'
import { useItemList } from '@/features/master/item/hooks/useItemQuery'
import type { ItemResponse } from '@/features/master/item/types'
import BomTable from '@/features/prod-basic/bom/components/BomTable'
import {
  useBomList,
  useCreateBom,
  useDeleteBom,
  useUpdateBom,
} from '@/features/prod-basic/bom/hooks/useBomQuery'
import type { BomResponse } from '@/features/prod-basic/bom/types'

interface InlineRow {
  materialItemId: string
  sequence: string
  quantity: string
  description: string
}

const emptyRow: InlineRow = { materialItemId: '', sequence: '', quantity: '', description: '' }

const BomManagementPage = () => {
  const [selectedItem, setSelectedItem] = useState<ItemResponse | null>(null)
  const [addingRow, setAddingRow] = useState(false)
  const [newRow, setNewRow] = useState<InlineRow>(emptyRow)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<InlineRow>(emptyRow)

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

  const parseRow = (row: InlineRow) => {
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

  const canAdd = Boolean(selectedItem) && !addingRow

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-strong)]">BOM 관리</h1>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          제품 생산에 필요한 자재 구성을 관리합니다.
        </p>
      </div>

      <div className="flex h-[calc(100vh-16rem)] gap-0">
        <div className="flex w-80 shrink-0 flex-col rounded-l-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex min-h-[52px] shrink-0 items-center border-b border-[var(--border)] px-4">
            <span className="text-sm font-semibold text-[var(--text-strong)]">품목 목록</span>
          </div>

          <ul className="flex-1 overflow-y-auto">
            {itemsLoading ? (
              <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                불러오는 중...
              </li>
            ) : items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                등록된 품목이 없습니다.
              </li>
            ) : (
              items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`cursor-pointer px-4 py-3 transition-colors ${
                    selectedItem?.id === item.id
                      ? 'bg-[var(--primary-soft)]'
                      : 'hover:bg-[var(--surface-alt)]'
                  }`}
                >
                  <p
                    className={`truncate text-sm font-medium ${
                      selectedItem?.id === item.id
                        ? 'text-[var(--primary)]'
                        : 'text-[var(--text-strong)]'
                    }`}
                  >
                    {item.itemName}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">
                    {item.itemCode}
                  </p>
                  {item.itemTypeName && (
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{item.itemTypeName}</p>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="flex flex-1 flex-col rounded-r-lg border border-l-0 border-[var(--border)] bg-[var(--surface)]">
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

          {!selectedItem ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
              좌측에서 품목을 선택하세요.
            </div>
          ) : bomsLoading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
              불러오는 중...
            </div>
          ) : (
            <BomTable
              boms={boms}
              materialOptions={materialOptions}
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
          )}
        </div>
      </div>
    </div>
  )
}

export default BomManagementPage
