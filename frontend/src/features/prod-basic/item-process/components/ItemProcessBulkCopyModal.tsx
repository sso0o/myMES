import { useState, useMemo } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import type { ItemResponse } from '@/features/master/item/types'
import type { ItemProcessResponse } from '../types'
import { CopyMode } from '../types'

interface ItemProcessBulkCopyModalProps {
  sourceItem: ItemResponse
  sourceProcesses: ItemProcessResponse[]
  allItems: ItemResponse[]
  onConfirm: (targetItemIds: number[], mode: CopyMode) => Promise<void>
  onClose: () => void
  isLoading: boolean
}

const ItemProcessBulkCopyModal = ({
  sourceItem,
  sourceProcesses,
  allItems,
  onConfirm,
  onClose,
  isLoading,
}: ItemProcessBulkCopyModalProps) => {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [mode, setMode] = useState<CopyMode>(CopyMode.REPLACE)

  const candidateItems = useMemo(
    () => allItems.filter((item) => item.id !== sourceItem.id),
    [allItems, sourceItem.id],
  )

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return candidateItems
    return candidateItems.filter(
      (item) =>
        item.itemName.toLowerCase().includes(q) || item.itemCode.toLowerCase().includes(q),
    )
  }, [candidateItems, search])

  const handleToggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      filteredItems.forEach((item) => next.add(item.id))
      return next
    })
  }

  const handleClearAll = () => {
    setSelectedIds(new Set())
  }

  const handleConfirm = async () => {
    await onConfirm(Array.from(selectedIds), mode)
  }

  const selectedCount = selectedIds.size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl bg-[var(--surface)] shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--text-strong)]">공정 일괄 적용</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* 원본 품목 정보 */}
        <div className="border-b border-[var(--border)] bg-[var(--surface-alt)] px-5 py-3">
          <p className="text-xs text-[var(--text-muted)]">원본 품목</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm font-medium text-[var(--text-strong)]">
              {sourceItem.itemName}
            </span>
            <span className="font-mono text-xs text-[var(--text-muted)]">{sourceItem.itemCode}</span>
            <span className="rounded bg-[var(--primary-soft)] px-2 py-0.5 text-xs text-[var(--primary)]">
              공정 {sourceProcesses.length}개
            </span>
          </div>
        </div>

        {/* 복사 방식 선택 */}
        <div className="border-b border-[var(--border)] px-5 py-3">
          <p className="mb-2 text-xs font-medium text-[var(--text-base)]">복사 방식</p>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-strong)]">
              <input
                type="radio"
                name="copyMode"
                value={CopyMode.REPLACE}
                checked={mode === CopyMode.REPLACE}
                onChange={() => setMode(CopyMode.REPLACE)}
                className="accent-[var(--primary)]"
              />
              덮어쓰기
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-strong)]">
              <input
                type="radio"
                name="copyMode"
                value={CopyMode.APPEND}
                checked={mode === CopyMode.APPEND}
                onChange={() => setMode(CopyMode.APPEND)}
                className="accent-[var(--primary)]"
              />
              뒤에 추가
            </label>
          </div>
          {mode === CopyMode.REPLACE && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md bg-[var(--warning-soft,#fef9c3)] px-3 py-2 text-xs text-[var(--warning,#92400e)]">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>선택한 대상 품목의 기존 공정이 모두 교체됩니다.</span>
            </div>
          )}
        </div>

        {/* 대상 품목 목록 */}
        <div className="flex flex-1 flex-col overflow-hidden px-5 py-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <input
              type="text"
              placeholder="품목명 또는 품목코드 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <button
              type="button"
              onClick={handleSelectAll}
              className="whitespace-nowrap rounded border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-base)] transition-colors hover:bg-[var(--surface-alt)]"
            >
              전체 선택
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="whitespace-nowrap rounded border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-base)] transition-colors hover:bg-[var(--surface-alt)]"
            >
              선택 해제
            </button>
          </div>

          <div className="mb-2 text-xs text-[var(--text-muted)]">
            {selectedCount > 0 ? (
              <span className="font-medium text-[var(--primary)]">{selectedCount}개 선택됨</span>
            ) : (
              <span>대상 품목을 선택하세요.</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto rounded border border-[var(--border)]">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                {search ? '검색 결과가 없습니다.' : '대상 품목이 없습니다.'}
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]/50">
                {filteredItems.map((item) => {
                  const checked = selectedIds.has(item.id)
                  return (
                    <li
                      key={item.id}
                      onClick={() => handleToggle(item.id)}
                      className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors ${checked ? 'bg-[var(--primary-soft)]' : 'hover:bg-[var(--surface-alt)]'}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggle(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-[var(--primary)]"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${checked ? 'text-[var(--primary)]' : 'text-[var(--text-strong)]'}`}
                        >
                          {item.itemName}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[var(--text-muted)]">
                            {item.itemCode}
                          </span>
                          {item.itemTypeName && (
                            <span className="text-xs text-[var(--text-muted)]">
                              {item.itemTypeName}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
          <button type="button" onClick={onClose} disabled={isLoading} className={cancelButtonClass}>
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedCount === 0 || isLoading}
            className={submitButtonClass}
          >
            {isLoading ? '적용 중...' : `${selectedCount}개 품목에 적용`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemProcessBulkCopyModal
