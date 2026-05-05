import { Check, Pencil, Trash2, X } from 'lucide-react'
import AppGridInput from '@/common/components/AppGridInput'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import type { ItemResponse } from '@/features/master/item/types'
import type { BomResponse } from '../types'

interface InlineRow {
  materialItemId: string
  sequence: string
  quantity: string
  description: string
}

interface BomTableProps {
  boms: BomResponse[]
  materialOptions: ItemResponse[]
  addingRow: boolean
  editingId: number | null
  newRow: InlineRow
  editRow: InlineRow
  isCreating: boolean
  isUpdating: boolean
  onCancelAdd: () => void
  onChangeNewRow: (row: InlineRow) => void
  onSaveAdd: () => void
  onStartEdit: (bom: BomResponse) => void
  onCancelEdit: () => void
  onChangeEditRow: (row: InlineRow) => void
  onSaveEdit: (bom: BomResponse) => void
  onDelete: (bom: BomResponse) => void
}

const BomTable = ({
  boms,
  materialOptions,
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
}: BomTableProps) => {
  const getMaterial = (materialItemId: number) =>
    materialOptions.find((item) => item.id === materialItemId)
  const sortedBoms = boms.slice().sort((a, b) => a.sequence - b.sequence)

  const inlineAddRow = (
    <tr className="bg-[var(--primary-soft)]/40">
      <td className="px-4 py-2">
        <AppGridInput
          type="number"
          value={newRow.sequence}
          onChange={(event) => onChangeNewRow({ ...newRow, sequence: event.target.value })}
          placeholder="1"
          slotProps={{ htmlInput: { min: 1 } }}
          sx={{ minWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
        />
      </td>
      <td className="px-4 py-2" colSpan={2}>
        <AppSelect
          value={newRow.materialItemId}
          onChange={(event) => onChangeNewRow({ ...newRow, materialItemId: event.target.value })}
          autoFocus
        >
          <AppMenuItem value="">자재 선택</AppMenuItem>
          {materialOptions.map((item) => (
            <AppMenuItem key={item.id} value={String(item.id)}>
              {item.itemCode} - {item.itemName}
            </AppMenuItem>
          ))}
        </AppSelect>
      </td>
      <td className="px-4 py-2 text-xs text-[var(--text-muted)]">
        {newRow.materialItemId
          ? (getMaterial(parseInt(newRow.materialItemId, 10))?.itemTypeName ?? '-')
          : '-'}
      </td>
      <td className="px-4 py-2">
        <AppGridInput
          type="number"
          value={newRow.quantity}
          onChange={(event) => onChangeNewRow({ ...newRow, quantity: event.target.value })}
          placeholder="1"
          slotProps={{ htmlInput: { min: '0.000001', step: '0.000001' } }}
          sx={{ minWidth: 112, '& .MuiInputBase-input': { textAlign: 'right' } }}
        />
      </td>
      <td className="px-4 py-2 text-center text-xs text-[var(--text-muted)]">
        {newRow.materialItemId ? (getMaterial(parseInt(newRow.materialItemId, 10))?.unit ?? '-') : '-'}
      </td>
      <td className="px-4 py-2">
        <AppGridInput
          value={newRow.description}
          onChange={(event) => onChangeNewRow({ ...newRow, description: event.target.value })}
          placeholder="비고"
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
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
            <th className="px-4 py-3 text-left font-medium">자재코드</th>
            <th className="px-4 py-3 text-left font-medium">자재명</th>
            <th className="px-4 py-3 text-left font-medium">자재구분</th>
            <th className="w-32 px-4 py-3 text-right font-medium">소요수량</th>
            <th className="w-20 px-4 py-3 text-center font-medium">단위</th>
            <th className="px-4 py-3 text-left font-medium">비고/설명</th>
            <th className="w-20 px-4 py-3 text-center font-medium">관리</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[var(--border)]/50">
          {sortedBoms.length === 0 && !addingRow && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-[var(--text-muted)]">
                등록된 자재가 없습니다.
              </td>
            </tr>
          )}

          {addingRow && sortedBoms.length === 0 && inlineAddRow}

          {sortedBoms.map((bom) =>
            editingId === bom.id ? (
              <tr key={bom.id} className="bg-[var(--primary-soft)]/40">
                <td className="px-4 py-2">
                  <AppGridInput
                    type="number"
                    value={editRow.sequence}
                    onChange={(event) => onChangeEditRow({ ...editRow, sequence: event.target.value })}
                    autoFocus
                    slotProps={{ htmlInput: { min: 1 } }}
                    sx={{ minWidth: 80, '& .MuiInputBase-input': { textAlign: 'center' } }}
                  />
                </td>
                <td className="px-4 py-2" colSpan={2}>
                  <AppSelect
                    value={editRow.materialItemId}
                    onChange={(event) => onChangeEditRow({ ...editRow, materialItemId: event.target.value })}
                  >
                    <AppMenuItem value="">자재 선택</AppMenuItem>
                    {materialOptions.map((item) => (
                      <AppMenuItem key={item.id} value={String(item.id)}>
                        {item.itemCode} - {item.itemName}
                      </AppMenuItem>
                    ))}
                  </AppSelect>
                </td>
                <td className="px-4 py-2 text-xs text-[var(--text-muted)]">
                  {editRow.materialItemId
                    ? (getMaterial(parseInt(editRow.materialItemId, 10))?.itemTypeName ?? '-')
                    : '-'}
                </td>
                <td className="px-4 py-2">
                  <AppGridInput
                    type="number"
                    value={editRow.quantity}
                    onChange={(event) => onChangeEditRow({ ...editRow, quantity: event.target.value })}
                    slotProps={{ htmlInput: { min: '0.000001', step: '0.000001' } }}
                    sx={{ minWidth: 112, '& .MuiInputBase-input': { textAlign: 'right' } }}
                  />
                </td>
                <td className="px-4 py-2 text-center text-xs text-[var(--text-muted)]">
                  {editRow.materialItemId
                    ? (getMaterial(parseInt(editRow.materialItemId, 10))?.unit ?? '-')
                    : '-'}
                </td>
                <td className="px-4 py-2">
                  <AppGridInput
                    value={editRow.description}
                    onChange={(event) => onChangeEditRow({ ...editRow, description: event.target.value })}
                    slotProps={{ htmlInput: { maxLength: 500 } }}
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSaveEdit(bom)}
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
              <tr key={bom.id} className="transition-colors hover:bg-[var(--surface-alt)]">
                <td className="px-4 py-3 text-center text-[var(--text-base)]">{bom.sequence}</td>
                <td className="px-4 py-3 font-mono text-[var(--text-base)]">{bom.materialItemCode}</td>
                <td className="px-4 py-3 text-[var(--text-strong)]">{bom.materialItemName}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{bom.materialItemTypeName ?? '-'}</td>
                <td className="px-4 py-3 text-right text-[var(--text-base)]">
                  {Number(bom.quantity).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center text-[var(--text-muted)]">{bom.unit}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{bom.description ?? '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onStartEdit(bom)}
                      className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      title="수정"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(bom)}
                      className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ),
          )}

          {addingRow && sortedBoms.length > 0 && inlineAddRow}
        </tbody>
      </table>
    </div>
  )
}

export default BomTable
