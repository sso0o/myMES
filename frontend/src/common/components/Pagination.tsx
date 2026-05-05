import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SelectChangeEvent } from '@mui/material/Select'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import {
  paginationIconButtonClass,
  paginationPageButtonActiveClass,
  paginationPageButtonClass,
} from '@/common/styles/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const getPageNumbers = (currentPage: number, totalPages: number): number[] => {
  const delta = 2
  const start = Math.max(0, currentPage - delta)
  const end = Math.min(totalPages - 1, currentPage + delta)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  const handlePageSizeChange = (e: SelectChangeEvent<string>) => {
    onPageSizeChange(Number(e.target.value))
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <span>총 {totalItems.toLocaleString()}건</span>
        <AppSelect
          value={String(pageSize)}
          onChange={handlePageSizeChange}
          sx={{ width: 112 }}
        >
          {pageSizeOptions.map((opt) => (
            <AppMenuItem key={opt} value={String(opt)}>
              {opt}건씩 보기
            </AppMenuItem>
          ))}
        </AppSelect>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={paginationIconButtonClass}
          >
            <ChevronLeft size={16} />
          </button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={p === currentPage ? paginationPageButtonActiveClass : paginationPageButtonClass}
            >
              {p + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className={paginationIconButtonClass}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default Pagination
