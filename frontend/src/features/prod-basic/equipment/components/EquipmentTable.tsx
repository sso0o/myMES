import { Pencil, Trash2 } from 'lucide-react'
import Badge from '@/common/components/Badge'
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
import type { EquipmentResponse } from '../types'

interface EquipmentTableProps {
  equipment: EquipmentResponse[]
  onEdit: (equipment: EquipmentResponse) => void
  onDelete: (equipment: EquipmentResponse) => void
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const EquipmentTable = ({
  equipment,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: EquipmentTableProps) => {
  return (
    <div className={tableContainerClass}>
      <table className={tableClass}>
        <thead className={tableHeadClass}>
          <tr>
            <th className="px-4 py-3 text-left font-medium">설비코드</th>
            <th className="px-4 py-3 text-left font-medium">설비명</th>
            <th className="px-4 py-3 text-left font-medium">설비유형</th>
            <th className="px-4 py-3 text-left font-medium">위치</th>
            <th className="px-4 py-3 text-left font-medium">제조사/모델</th>
            <th className="px-4 py-3 text-left font-medium">구입일</th>
            <th className="px-4 py-3 text-center font-medium">사용여부</th>
            <th className="px-4 py-3 text-left font-medium">등록일</th>
            <th className="px-4 py-3 text-center font-medium">관리</th>
          </tr>
        </thead>
        <tbody className={tableBodyClass}>
          {equipment.length === 0 ? (
            <tr>
              <td colSpan={9} className={tableEmptyCellClass}>
                등록된 설비가 없습니다.
              </td>
            </tr>
          ) : (
            equipment.map((item) => (
              <tr key={item.id} className={tableRowClass}>
                <td className="px-4 py-3 font-mono text-[var(--text-base)]">
                  {item.equipmentCode}
                </td>
                <td className="px-4 py-3 text-[var(--text-strong)]">{item.equipmentName}</td>
                <td className="px-4 py-3">
                  {item.equipmentTypeName ? (
                    <Badge shape="rounded">{item.equipmentTypeName}</Badge>
                  ) : (
                    <span className="text-[var(--text-muted)]">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--text-base)]">
                  {item.location ?? <span className="text-[var(--text-muted)]">-</span>}
                </td>
                <td className="px-4 py-3 text-[var(--text-base)]">
                  {item.manufacturer || item.modelName ? (
                    <span>
                      {item.manufacturer ?? '-'}
                      {item.modelName ? (
                        <span className="ml-1 text-[var(--text-muted)]">/ {item.modelName}</span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {item.purchaseDate
                    ? new Date(item.purchaseDate).toLocaleDateString('ko-KR')
                    : '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={item.isActive ? 'success' : 'muted'}>
                    {item.isActive ? '사용' : '미사용'}
                  </Badge>
                </td>
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

export default EquipmentTable
