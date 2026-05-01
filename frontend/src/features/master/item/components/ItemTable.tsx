import { Pencil, Trash2 } from 'lucide-react'
import Pagination from '@/common/components/Pagination'
import { deleteIconButtonClass, editIconButtonClass } from '@/common/styles/button'
import {
  tableBodyClass,
  tableClass,
  tableContainerClass,
  tableEmptyCellClass,
  tableHeadClass,
  tableRowClass,
} from '@/common/styles/table'
import type { ItemResponse } from '../types'

interface ItemTableProps {
  items: ItemResponse[]
  onEdit: (item: ItemResponse) => void
  onDelete: (item: ItemResponse) => void
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const ItemTable = ({
  items,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ItemTableProps) => {
  return (
    <div className={tableContainerClass}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className="px-4 py-3 text-left font-medium">품목코드</th>
            <th className="px-4 py-3 text-left font-medium">품목명</th>
            <th className="px-4 py-3 text-left font-medium">단위</th>
            <th className="px-4 py-3 text-left font-medium">등록일</th>
            <th className="px-4 py-3 text-center font-medium">관리</th>
          </tr>
        </thead>
        <tbody className={tableBodyClass}>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className={tableEmptyCellClass}
              >
                등록된 품목이 없습니다.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className={tableRowClass}
              >
                <td className="px-4 py-3 font-mono text-[var(--text-base)]">
                  {item.itemCode}
                </td>
                <td className="px-4 py-3 text-[var(--text-strong)]">
                  {item.itemName}
                </td>
                <td className="px-4 py-3 text-[var(--text-base)]">{item.unit}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className={editIconButtonClass}
                      title="수정"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className={deleteIconButtonClass}
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="border-t border-[var(--border)]">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

export default ItemTable
