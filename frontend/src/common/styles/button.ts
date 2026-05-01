/** 모달 취소 버튼 */
export const cancelButtonClass =
  'rounded-lg px-4 py-2 text-sm text-[var(--text-base)] transition-colors hover:bg-[var(--surface-alt)]'

/** 모달 제출(등록/수정) 버튼 */
export const submitButtonClass =
  'rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50'

/** 패널 헤더의 주요 액션 버튼 */
export const primaryActionButtonClass =
  'flex items-center gap-1 rounded-md bg-[var(--primary)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[var(--surface-alt)] disabled:text-[var(--text-muted)] disabled:opacity-60'

/** 페이지 헤더의 주요 액션 버튼 */
export const pagePrimaryActionButtonClass =
  'flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)]'

/** 수정 아이콘 버튼 */
export const editIconButtonClass =
  'rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]'

/** 삭제 아이콘 버튼 */
export const deleteIconButtonClass =
  'rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]'

/** 저장 아이콘 버튼 */
export const saveIconButtonClass =
  'rounded p-1.5 text-[var(--success)] transition-colors hover:bg-[var(--success-soft)] disabled:opacity-50'

/** 취소 아이콘 버튼 */
export const cancelIconButtonClass =
  'rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)]'

/** 페이지네이션 이전/다음 아이콘 버튼 */
export const paginationIconButtonClass =
  'flex h-8 w-8 items-center justify-center rounded text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)] disabled:cursor-not-allowed disabled:opacity-40'

/** 페이지네이션 페이지 번호 버튼 — 비활성 */
export const paginationPageButtonClass =
  'flex h-8 min-w-[2rem] items-center justify-center rounded px-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)]'

/** 페이지네이션 페이지 번호 버튼 — 활성(현재 페이지) */
export const paginationPageButtonActiveClass =
  'flex h-8 min-w-[2rem] items-center justify-center rounded px-2 text-sm font-medium bg-[var(--primary)] text-[var(--text-inverse)]'
