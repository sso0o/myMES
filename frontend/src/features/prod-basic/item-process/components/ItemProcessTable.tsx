import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { ProcessResponse } from '@/features/master/process/types'
import type { ItemProcessResponse } from '../types'

interface InlineRow {
  processId: string
  sequence: string
}

interface ItemProcessTableProps {
  itemProcesses: ItemProcessResponse[]
  processOptions: ProcessResponse[]
  addingRow: boolean
  editingId: number | null
  newRow: InlineRow
  editRow: InlineRow
  isCreating: boolean
  isUpdating: boolean
  onCancelAdd: () => void
  onChangeNewRow: (row: InlineRow) => void
  onSaveAdd: () => void
  onStartEdit: (ip: ItemProcessResponse) => void
  onCancelEdit: () => void
  onChangeEditRow: (row: InlineRow) => void
  onSaveEdit: (ip: ItemProcessResponse) => void
  onDelete: (ip: ItemProcessResponse) => void
}

const inputCls =
  'w-full rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-strong)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
const sequenceInputCls = `${inputCls} min-w-20 text-center`

const ItemProcessTable = ({
  itemProcesses,
  processOptions,
  addingRow,
  editingId,
  newRow,
  editRow,
  isCreating,
  isUpdating,
  onCancelAdd,
  onChangeNewRow,
  onSaveAdd,
  onStartEdit,
  onCancelEdit,
  onChangeEditRow,
  onSaveEdit,
  onDelete,
}: ItemProcessTableProps) => {
  const activeProcesses = processOptions.filter((p) => p.isActive)
  const getProcess = (processId: number) => processOptions.find((p) => p.id === processId)

  const sortedProcesses = itemProcesses.slice().sort((a, b) => a.sequence - b.sequence)

  const inlineAddRow = (
    <tr className="bg-[var(--primary-soft)]/40">
      <td className="px-4 py-2">
        <input
          className={sequenceInputCls}
          type="number"
          min={1}
          value={newRow.sequence}
          onChange={(e) => onChangeNewRow({ ...newRow, sequence: e.target.value })}
          placeholder="1"
        />
      </td>
      <td className="px-4 py-2 font-mono text-xs text-[var(--text-muted)]" colSpan={2}>
        <select
          className={inputCls}
          value={newRow.processId}
          onChange={(e) => onChangeNewRow({ ...newRow, processId: e.target.value })}
          autoFocus
        >
          <option value="">공정 선택</option>
          {activeProcesses.map((p) => (
            <option key={p.id} value={p.id}>
              {p.processCode} — {p.processName}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2 text-xs text-[var(--text-muted)]">
        {newRow.processId ? (getProcess(parseInt(newRow.processId, 10))?.processTypeName ?? '-') : '-'}
      </td>
      <td className="px-4 py-2 text-center text-xs text-[var(--text-muted)]">
        {newRow.processId ? (getProcess(parseInt(newRow.processId, 10))?.standardTime ?? '-') : '-'}
      </td>
      <td className="px-4 py-2 text-xs text-[var(--text-muted)]">
        {newRow.processId ? (getProcess(parseInt(newRow.processId, 10))?.description ?? '-') : '-'}
      </td>
      <td className="px-4 py-2">
        <div className="flex justify-center gap-1">
          <button
            type="button"
            onClick={onSaveAdd}
            disabled={isCreating}
            className="rounded p-1.5 text-[var(--success)] transition-colors hover:bg-[var(--success-soft)] disabled:opacity-50"
            title="저장"
          >
            <Check size={15} />
          </button>
          <button
            type="button"
            onClick={onCancelAdd}
            className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)]"
            title="취소"
          >
            <X size={15} />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[var(--surface-alt)] text-[var(--text-base)]">
          <tr>
            <th className="w-24 px-4 py-3 text-center font-medium">순서</th>
            <th className="px-4 py-3 text-left font-medium">공정코드</th>
            <th className="px-4 py-3 text-left font-medium">공정명</th>
            <th className="px-4 py-3 text-left font-medium">공정유형</th>
            <th className="w-28 px-4 py-3 text-center font-medium">표준시간(분)</th>
            <th className="px-4 py-3 text-left font-medium">비고/설명</th>
            <th className="w-20 px-4 py-3 text-center font-medium">관리</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[var(--border)]/50">
          {sortedProcesses.length === 0 && !addingRow && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-[var(--text-muted)]">
                등록된 공정이 없습니다.
              </td>
            </tr>
          )}

          {addingRow && sortedProcesses.length === 0 && inlineAddRow}

          {sortedProcesses.map((ip) => {
            const proc = getProcess(ip.processId)
            return editingId === ip.id ? (
              <tr key={ip.id} className="bg-[var(--primary-soft)]/40">
                <td className="px-4 py-2">
                  <input
                    className={sequenceInputCls}
                    type="number"
                    min={1}
                    value={editRow.sequence}
                    onChange={(e) => onChangeEditRow({ ...editRow, sequence: e.target.value })}
                    autoFocus
                  />
                </td>
                <td className="px-4 py-2" colSpan={2}>
                  <select
                    className={inputCls}
                    value={editRow.processId}
                    onChange={(e) => onChangeEditRow({ ...editRow, processId: e.target.value })}
                  >
                    <option value="">공정 선택</option>
                    {activeProcesses.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.processCode} — {p.processName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-xs text-[var(--text-muted)]">
                  {editRow.processId
                    ? (getProcess(parseInt(editRow.processId, 10))?.processTypeName ?? '-')
                    : '-'}
                </td>
                <td className="px-4 py-2 text-center text-xs text-[var(--text-muted)]">
                  {editRow.processId
                    ? (getProcess(parseInt(editRow.processId, 10))?.standardTime ?? '-')
                    : '-'}
                </td>
                <td className="px-4 py-2 text-xs text-[var(--text-muted)]">
                  {editRow.processId
                    ? (getProcess(parseInt(editRow.processId, 10))?.description ?? '-')
                    : '-'}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSaveEdit(ip)}
                      disabled={isUpdating}
                      className="rounded p-1.5 text-[var(--success)] transition-colors hover:bg-[var(--success-soft)] disabled:opacity-50"
                      title="저장"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)]"
                      title="취소"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={ip.id} className="transition-colors hover:bg-[var(--surface-alt)]">
                <td className="px-4 py-3 text-center text-[var(--text-base)]">{ip.sequence}</td>
                <td className="px-4 py-3 font-mono text-[var(--text-base)]">{ip.processCode}</td>
                <td className="px-4 py-3 text-[var(--text-strong)]">{ip.processName}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{proc?.processTypeName ?? '-'}</td>
                <td className="px-4 py-3 text-center text-[var(--text-muted)]">
                  {proc?.standardTime ?? '-'}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{proc?.description ?? '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onStartEdit(ip)}
                      className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      title="수정"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(ip)}
                      className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}

          {addingRow && sortedProcesses.length > 0 && inlineAddRow}
        </tbody>
      </table>
    </div>
  )
}

export default ItemProcessTable
