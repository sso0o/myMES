import { Check, Pencil, Trash2, X } from 'lucide-react'
import {
  cancelIconButtonClass,
  deleteIconButtonClass,
  editIconButtonClass,
  saveIconButtonClass,
} from '@/common/styles/button'
import AppGridInput from '@/common/components/AppGridInput'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import {
  tableBodyClass,
  tableClass,
  tableEmptyCellClass,
  tableHeadClass,
  tableInlineEditRowClass,
  tableRowClass,
  tableScrollClass,
} from '@/common/styles/table'
import type { ProcessResponse } from '@/features/prod-basic/process/types'
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
    <tr className={tableInlineEditRowClass}>
      <td className="px-4 py-2">
        <AppGridInput
          type="number"
          value={newRow.sequence}
          onChange={(e) => onChangeNewRow({ ...newRow, sequence: e.target.value })}
          placeholder="1"
          slotProps={{ htmlInput: { min: 1 } }}
          sx={{ minWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
        />
      </td>
      <td className="px-4 py-2 font-mono text-xs text-[var(--text-muted)]" colSpan={2}>
        <AppSelect
          value={newRow.processId}
          onChange={(e) => onChangeNewRow({ ...newRow, processId: e.target.value })}
          autoFocus
        >
          <AppMenuItem value="">공정 선택</AppMenuItem>
          {activeProcesses.map((p) => (
            <AppMenuItem key={p.id} value={String(p.id)}>
              {p.processCode} — {p.processName}
            </AppMenuItem>
          ))}
        </AppSelect>
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
            className={saveIconButtonClass}
            title="저장"
          >
            <Check size={15} />
          </button>
          <button
            type="button"
            onClick={onCancelAdd}
            className={cancelIconButtonClass}
            title="취소"
          >
            <X size={15} />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className={tableScrollClass}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
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

        <tbody className={tableBodyClass}>
          {sortedProcesses.length === 0 && !addingRow && (
            <tr>
              <td colSpan={7} className={tableEmptyCellClass}>
                등록된 공정이 없습니다.
              </td>
            </tr>
          )}

          {addingRow && sortedProcesses.length === 0 && inlineAddRow}

          {sortedProcesses.map((ip) => {
            const proc = getProcess(ip.processId)
            return editingId === ip.id ? (
              <tr key={ip.id} className={tableInlineEditRowClass}>
                <td className="px-4 py-2">
                  <AppGridInput
                    type="number"
                    value={editRow.sequence}
                    onChange={(e) => onChangeEditRow({ ...editRow, sequence: e.target.value })}
                    autoFocus
                    slotProps={{ htmlInput: { min: 1 } }}
                    sx={{ minWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
                  />
                </td>
                <td className="px-4 py-2" colSpan={2}>
                  <AppSelect
                    value={editRow.processId}
                    onChange={(e) => onChangeEditRow({ ...editRow, processId: e.target.value })}
                  >
                    <AppMenuItem value="">공정 선택</AppMenuItem>
                    {activeProcesses.map((p) => (
                      <AppMenuItem key={p.id} value={String(p.id)}>
                        {p.processCode} — {p.processName}
                      </AppMenuItem>
                    ))}
                  </AppSelect>
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
                      className={saveIconButtonClass}
                      title="저장"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className={cancelIconButtonClass}
                      title="취소"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={ip.id} className={tableRowClass}>
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
                      className={editIconButtonClass}
                      title="수정"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(ip)}
                      className={deleteIconButtonClass}
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
