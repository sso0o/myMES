interface EmptyStateProps {
  message: string
  fill?: boolean
}

/**
 * 목록 없음, 선택 필요, 로딩 같은 비어 있는 화면 상태를 표시합니다.
 */
const EmptyState = ({ message, fill = false }: EmptyStateProps) => {
  if (fill) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
        {message}
      </div>
    )
  }

  return <div className="py-20 text-center text-sm text-[var(--text-muted)]">{message}</div>
}

export default EmptyState
