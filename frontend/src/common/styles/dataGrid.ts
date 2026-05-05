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
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'hidden',

  '& .MuiDataGrid-main': {
    minWidth: 0,
    overflow: 'hidden',
  },

  // ── 컬럼 헤더 ────────────────────────────────────────────
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: 'var(--surface-alt)',
    borderBottom: 0,
  },
  '& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaders .MuiDataGrid-filler, & .MuiDataGrid-columnHeaders .MuiDataGrid-scrollbarFiller': {
    bgcolor: 'var(--surface-alt)',
  },
  '& .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller': {
    bgcolor: 'var(--surface)',
    borderTop: 0,
  },
  '& .MuiDataGrid-row--borderBottom .MuiDataGrid-columnHeader, & .MuiDataGrid-row--borderBottom .MuiDataGrid-filler, & .MuiDataGrid-row--borderBottom .MuiDataGrid-scrollbarFiller, & .MuiDataGrid-filler--borderBottom': {
    borderBottom: '1px solid var(--border)',
  },
  '& .MuiDataGrid-columnHeader': {
    color: 'var(--text-base)',
    fontWeight: 500,
    fontSize: '0.875rem',
    px: 1.5,
    '&:focus, &:focus-within': {
      outline: '2px solid var(--primary)',
      outlineOffset: '-2px',
    },
  },
  '& .MuiDataGrid-columnHeaderTitleContainer': {
    justifyContent: 'center',
  },
  '& .MuiDataGrid-columnHeaderTitleContainerContent': {
    justifyContent: 'center',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 500,
    textAlign: 'center',
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
    px: 1.5,
    borderBottom: 0,
    color: 'var(--text-base)',
    '&:focus, &:focus-within': {
      outline: '2px solid var(--primary)',
      outlineOffset: '-2px',
    },
  },
  '& .MuiDataGrid-row--borderBottom .MuiDataGrid-cell': {
    borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)',
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
    bgcolor: 'var(--surface)',
    minHeight: '160px',
  },
  '& .MuiDataGrid-overlay': {
    bgcolor: 'var(--surface)',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
  },

  // ── 푸터 (페이지네이션) ───────────────────────────────────
  '& .MuiDataGrid-footerContainer': {
    borderTop: '1px solid var(--border)',
    bgcolor: 'var(--surface)',
    minHeight: '48px',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  '& .MuiTablePagination-root': {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  '& .MuiTablePagination-toolbar': {
    maxWidth: '100%',
    minHeight: '48px',
    overflow: 'hidden',
    px: 1.5,
  },
  '& .MuiTablePagination-spacer': {
    flex: '1 1 auto',
    minWidth: 0,
  },
  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  '& .MuiTablePagination-select': {
    color: 'var(--text-base)',
  },
  '& .MuiTablePagination-actions': {
    flexShrink: 0,
    ml: 0.5,
  },
  '& .MuiIconButton-root': {
    color: 'var(--text-muted)',
    '&.Mui-disabled': {
      opacity: 0.4,
    },
  },

  // ── 스크롤바 ─────────────────────────────────────────────
  '& .MuiDataGrid-virtualScroller': {
    bgcolor: 'var(--surface)',
    borderTop: 0,
    overflowX: 'auto',
  },
  '& .MuiDataGrid-virtualScrollerContent, & .MuiDataGrid-virtualScrollerRenderZone': {
    bgcolor: 'var(--surface)',
  },
}
