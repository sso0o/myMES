import { Pencil, Trash2 } from 'lucide-react'
import Pagination from '@/common/components/Pagination'
import type { ProcessResponse } from '../types'

interface ProcessTableProps {
  processes: ProcessResponse[]
  onEdit: (process: ProcessResponse) => void
  onDelete: (process: ProcessResponse) => void
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const ProcessTable = ({
  processes,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ProcessTableProps) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--surface-alt)] text-[var(--text-base)]">
          <tr>
            <th className="px-4 py-3 text-left font-medium">공정코드</th>
            <th className="px-4 py-3 text-left font-medium">공정명</th>
            <th className="px-4 py-3 text-left font-medium">공정유형</th>
            <th className="px-4 py-3 text-right font-medium">표준시간(분)</th>
            <th className="px-4 py-3 text-center font-medium">사용여부</th>
            <th className="px-4 py-3 text-left font-medium">등록일</th>
            <th className="px-4 py-3 text-center font-medium">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]/50">
          {processes.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-[var(--text-muted)]">
                등록된 공정이 없습니다.
              </td>
            </tr>
          ) : (
            processes.map((process) => (
              <tr key={process.id} className="transition-colors hover:bg-[var(--surface-alt)]">
                <td className="px-4 py-3 font-mono text-[var(--text-base)]">
                  {process.processCode}
                </td>
                <td className="px-4 py-3 text-[var(--text-strong)]">{process.processName}</td>
                <td className="px-4 py-3">
                  {process.processTypeName ? (
                    <span className="inline-flex items-center rounded-md bg-[var(--primary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                      {process.processTypeName}
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-[var(--text-base)]">
                  {process.standardTime != null ? process.standardTime.toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      process.isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-[var(--surface-alt)] text-[var(--text-muted)]'
                    }`}
                  >
                    {process.isActive ? '사용' : '미사용'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {new Date(process.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(process)}
                      className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      title="수정"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(process)}
                      className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
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

export default ProcessTable
