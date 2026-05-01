import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'success' | 'muted'
  shape?: 'rounded' | 'pill'
  className?: string
}

const variantClass = {
  primary: 'bg-[var(--primary-soft)] text-[var(--primary)]',
  success: 'bg-[var(--success-soft)] text-[var(--success)]',
  muted: 'bg-[var(--surface-alt)] text-[var(--text-muted)]',
}

const shapeClass = {
  rounded: 'rounded-md',
  pill: 'rounded-full',
}

/**
 * 상태나 유형 값을 작은 라벨 형태로 일관되게 표시합니다.
 */
const Badge = ({
  children,
  variant = 'primary',
  shape = 'pill',
  className = '',
}: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${shapeClass[shape]} ${variantClass[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
