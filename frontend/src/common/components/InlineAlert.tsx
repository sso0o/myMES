import type { ReactNode } from 'react'

interface InlineAlertProps {
  children: ReactNode
  variant?: 'danger'
}

const variantClass = {
  danger:
    'border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--danger)]',
}

/**
 * 페이지나 패널 안에서 표시되는 짧은 피드백 메시지를 렌더링합니다.
 */
const InlineAlert = ({ children, variant = 'danger' }: InlineAlertProps) => {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${variantClass[variant]}`}>
      {children}
    </div>
  )
}

export default InlineAlert
