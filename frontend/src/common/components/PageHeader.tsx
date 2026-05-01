import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

/**
 * 페이지 제목, 설명, 우측 액션 영역을 일관된 레이아웃으로 렌더링합니다.
 */
const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-strong)]">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      {actions}
    </div>
  )
}

export default PageHeader
