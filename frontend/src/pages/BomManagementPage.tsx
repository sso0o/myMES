import { useEffect, useState } from 'react'
import { Copy, History, Plus, Save } from 'lucide-react'
import { primaryActionButtonClass } from '@/common/styles/button'
import { useFeedback } from '@/common/hooks/useFeedback'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useItemList } from '@/features/master/item/hooks/useItemQuery'
import type { ItemResponse } from '@/features/master/item/types'
import BomBulkCopyModal from '@/features/prod-basic/bom/components/BomBulkCopyModal'
import BomDataGrid, { type BomInlineRow } from '@/features/prod-basic/bom/components/BomDataGrid'
import BomItemDataGrid from '@/features/prod-basic/bom/components/BomItemDataGrid'
import {
  useBomList,
  useBomVersionHistory,
  useBulkCopyBom,
  useRestoreBomVersion,
  useSaveBom,
} from '@/features/prod-basic/bom/hooks/useBomQuery'
import type { BomCopyMode, BomResponse } from '@/features/prod-basic/bom/types'

const emptyRow: BomInlineRow = { materialItemId: '', sequence: '', quantity: '', description: '' }
const EMPTY_BOMS: BomResponse[] = []

const BomManagementPage = () => {
  const [selectedItem, setSelectedItem] = useState<ItemResponse | null>(null)
  const [localBoms, setLocalBoms] = useState<BomResponse[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
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

  const { data: boms = EMPTY_BOMS, isLoading: bomsLoading } = useBomList(selectedItem?.id ?? null)
  const { data: versions = [] } = useBomVersionHistory(selectedItem?.id ?? null)

  const saveBom = useSaveBom()
  const restoreVersion = useRestoreBomVersion()
  const bulkCopyBom = useBulkCopyBom()

  // 서버 데이터가 갱신되면 로컬 상태 동기화
  useEffect(() => {
    setLocalBoms(boms)
    setIsDirty(false)
  }, [boms])

  const resetInlineRows = () => {
    setAddingRow(false)
    setNewRow(emptyRow)
    setEditingId(null)
    setEditRow(emptyRow)
  }

  const handleSelectItem = (item: ItemResponse) => {
    setSelectedItem(item)
    setShowVersionHistory(false)
    resetInlineRows()
  }

  const handleStartAdd = () => {
    setEditingId(null)
    const nextSequence =
      localBoms.length === 0 ? 1 : Math.max(...localBoms.map((b) => b.sequence)) + 1
    setNewRow({ materialItemId: '', sequence: String(nextSequence), quantity: '1', description: '' })
    setAddingRow(true)
  }

  const handleCancelAdd = () => {
    setAddingRow(false)
    setNewRow(emptyRow)
  }

  const parseRow = (row: BomInlineRow) => ({
    materialItemId: parseInt(row.materialItemId, 10),
    sequence: parseInt(row.sequence, 10),
    quantity: Number(row.quantity),
  })

  const handleSaveAdd = () => {
    if (!selectedItem) return
    const { materialItemId, sequence, quantity } = parseRow(newRow)
    if (
      Number.isNaN(materialItemId) ||
      Number.isNaN(sequence) ||
      sequence < 1 ||
      Number.isNaN(quantity) ||
      quantity <= 0
    ) {
      showToast({ title: '자재, 순서, 소요수량을 올바르게 입력해주세요.', variant: 'error' })
      return
    }

    const material = materialOptions.find((i) => i.id === materialItemId)
    const tempId = -Date.now()

    setLocalBoms((prev) => [
      ...prev,
      {
        id: tempId,
        parentItemId: selectedItem.id,
        parentItemCode: selectedItem.itemCode,
        parentItemName: selectedItem.itemName,
        materialItemId,
        materialItemCode: material?.itemCode ?? '',
        materialItemName: material?.itemName ?? '',
        materialItemTypeName: material?.itemTypeName ?? null,
        unit: material?.unit ?? '',
        sequence,
        quantity,
        description: newRow.description.trim() || null,
        versionId: 0,
        versionNo: 0,
        versionStatus: 'ACTIVE',
        createdAt: '',
      },
    ])
    setIsDirty(true)
    setAddingRow(false)
    setNewRow(emptyRow)
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
    const { materialItemId, sequence, quantity } = parseRow(editRow)
    if (
      Number.isNaN(materialItemId) ||
      Number.isNaN(sequence) ||
      sequence < 1 ||
      Number.isNaN(quantity) ||
      quantity <= 0
    ) {
      showToast({ title: '자재, 순서, 소요수량을 올바르게 입력해주세요.', variant: 'error' })
      return
    }

    const material = materialOptions.find((i) => i.id === materialItemId)
    setLocalBoms((prev) =>
      prev.map((b) =>
        b.id === bom.id
          ? {
              ...b,
              materialItemId,
              materialItemCode: material?.itemCode ?? '',
              materialItemName: material?.itemName ?? '',
              materialItemTypeName: material?.itemTypeName ?? null,
              unit: material?.unit ?? '',
              sequence,
              quantity,
              description: editRow.description.trim() || null,
            }
          : b,
      ),
    )
    setIsDirty(true)
    setEditingId(null)
    setEditRow(emptyRow)
  }

  const handleDelete = async (bom: BomResponse) => {
    const confirmed = await showAlert({
      title: '자재 삭제',
      message: `"${bom.materialItemName}" 자재를 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return
    setLocalBoms((prev) => prev.filter((b) => b.id !== bom.id))
    setIsDirty(true)
  }

  const handleSaveBom = () => {
    if (!selectedItem) return
    saveBom.mutate(
      {
        parentItemId: selectedItem.id,
        data: {
          lines: localBoms.map((b) => ({
            materialItemId: b.materialItemId,
            sequence: b.sequence,
            quantity: b.quantity,
            description: b.description ?? undefined,
          })),
        },
      },
      {
        onSuccess: () => showToast({ title: 'BOM을 저장했습니다.', variant: 'success' }),
        onError: (error) =>
          showToast({ title: getApiErrorMessage(error, '저장 중 오류가 발생했습니다.'), variant: 'error' }),
      },
    )
  }

  const handleRestoreVersion = async (versionId: number, versionNo: number) => {
    if (!selectedItem) return
    const confirmed = await showAlert({
      title: '버전 복원',
      message: `v${versionNo} 버전으로 복원하시겠습니까? 현재 버전은 이력으로 보존됩니다.`,
      confirmText: '복원',
    })
    if (!confirmed) return

    restoreVersion.mutate(
      { parentItemId: selectedItem.id, versionId },
      {
        onSuccess: () => {
          showToast({ title: `v${versionNo} 버전으로 복원했습니다.`, variant: 'success' })
          setShowVersionHistory(false)
        },
        onError: (error) =>
          showToast({ title: getApiErrorMessage(error, '복원 중 오류가 발생했습니다.'), variant: 'error' }),
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
          onError: (error) => {
            showToast({ title: getApiErrorMessage(error, 'BOM 적용 중 오류가 발생했습니다.'), variant: 'error' })
            reject()
          },
        },
      )
    })
  }

  const activeVersion = versions.find((v) => v.status === 'ACTIVE')
  const canAdd = Boolean(selectedItem) && !addingRow
  const canBulkCopy = Boolean(selectedItem) && localBoms.length > 0

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
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-strong)]">
                  {selectedItem ? selectedItem.itemName : 'BOM 구성'}
                </span>
                {selectedItem && (
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    {selectedItem.itemCode}
                  </span>
                )}
                {activeVersion && (
                  <span className="rounded bg-[var(--primary-soft)] px-2 py-0.5 text-xs text-[var(--primary)]">
                    v{activeVersion.versionNo}
                  </span>
                )}
                {isDirty && (
                  <span className="rounded bg-[var(--warning-soft,#fef9c3)] px-2 py-0.5 text-xs text-[var(--warning,#92400e)]">
                    미저장
                  </span>
                )}
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-2">
                {selectedItem && versions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowVersionHistory((v) => !v)}
                    className={primaryActionButtonClass}
                  >
                    <History size={13} />
                    버전 이력
                  </button>
                )}
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
                <button
                  type="button"
                  onClick={handleSaveBom}
                  disabled={!selectedItem || !isDirty || saveBom.isPending}
                  className={primaryActionButtonClass}
                >
                  <Save size={13} />
                  {saveBom.isPending ? '저장 중...' : 'BOM 저장'}
                </button>
              </div>
            </div>

            {/* 버전 이력 패널 */}
            {showVersionHistory && selectedItem && (
              <div className="border-b border-[var(--border)] bg-[var(--surface-alt)] px-5 py-3">
                <p className="mb-2 text-xs font-semibold text-[var(--text-base)]">버전 이력</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {versions.map((v) => (
                    <div
                      key={v.id}
                      className="flex shrink-0 items-center gap-2 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-[var(--text-strong)]">v{v.versionNo}</span>
                      <span
                        className={
                          v.status === 'ACTIVE'
                            ? 'text-[var(--primary)]'
                            : 'text-[var(--text-muted)]'
                        }
                      >
                        {v.status === 'ACTIVE' ? '활성' : '비활성'}
                      </span>
                      {v.status === 'INACTIVE' && (
                        <button
                          type="button"
                          onClick={() => handleRestoreVersion(v.id, v.versionNo)}
                          disabled={restoreVersion.isPending}
                          className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[var(--text-base)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                        >
                          복원
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!selectedItem ? (
              <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
                좌측에서 품목을 선택하세요.
              </div>
            ) : (
              <div className="min-h-0 flex-1">
                <BomDataGrid
                  boms={localBoms}
                  materialOptions={materialOptions}
                  loading={bomsLoading}
                  addingRow={addingRow}
                  editingId={editingId}
                  newRow={newRow}
                  editRow={editRow}
                  isCreating={false}
                  isUpdating={false}
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
          sourceBoms={localBoms}
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
