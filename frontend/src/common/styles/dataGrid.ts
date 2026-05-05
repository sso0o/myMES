import type { SystemStyleObject, Theme } from '@mui/system'

/**
 * AppDataGrid 기본 sx 스타일 — index.css CSS 변수 기반으로 기존 HTML table 톤에 맞춤.
 * 소비자가 AppDataGrid의 sx prop으로 덮어쓸 수 있음.
 */
export const appDataGridSx: SystemStyleObject<Theme> = {
  // ── 컨테이너 ──────────────────────────────────────────────
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  bgcolor: 'var(--surface)',
  fontFamily: 'var(--sans)',
  fontSize: '0.875rem',
  color: 'var(--text-base)',

  // ── 컬럼 헤더 ────────────────────────────────────────────
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: 'var(--surface-alt)',
    borderBottom: '1px solid var(--border)',
  },
  '& .MuiDataGrid-columnHeader': {
    color: 'var(--text-base)',
    fontWeight: 500,
    fontSize: '0.875rem',
    px: 2,
    '&:focus, &:focus-within': {
      outline: '2px solid var(--primary)',
      outlineOffset: '-2px',
    },
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 500,
  },
  '& .MuiDataGrid-columnSeparator': {
    color: 'var(--border)',
  },
  '& .MuiDataGrid-sortIcon': {
    color: 'var(--primary)',
  },
  '& .MuiDataGrid-menuIconButton': {
    color: 'var(--text-muted)',
  },

  // ── 셀 / 행 ──────────────────────────────────────────────
  '& .MuiDataGrid-cell': {
    px: 2,
    borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)',
    color: 'var(--text-base)',
    '&:focus, &:focus-within': {
      outline: '2px solid var(--primary)',
      outlineOffset: '-2px',
    },
  },
  '& .MuiDataGrid-row': {
    transition: 'background-color 150ms',
    '&:hover': {
      bgcolor: 'var(--surface-alt)',
    },
    '&.Mui-selected': {
      bgcolor: 'var(--primary-soft)',
      '&:hover': {
        bgcolor: 'var(--primary-soft)',
      },
    },
  },

  // ── 빈 상태 오버레이 ──────────────────────────────────────
  '& .MuiDataGrid-overlayWrapper': {
    minHeight: '160px',
  },
  '& .MuiDataGrid-overlay': {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
  },

  // ── 푸터 (페이지네이션) ───────────────────────────────────
  '& .MuiDataGrid-footerContainer': {
    borderTop: '1px solid var(--border)',
    bgcolor: 'var(--surface)',
    minHeight: '48px',
  },
  '& .MuiTablePagination-root': {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
  },
  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  '& .MuiTablePagination-select': {
    color: 'var(--text-base)',
  },
  '& .MuiIconButton-root': {
    color: 'var(--text-muted)',
    '&.Mui-disabled': {
      opacity: 0.4,
    },
  },

  // ── 스크롤바 ─────────────────────────────────────────────
  '& .MuiDataGrid-virtualScroller': {
    overflowX: 'auto',
  },
}
