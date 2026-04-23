import { useEffect, type PropsWithChildren } from 'react'
import { useUiStore, type ToastVariant } from '@/store/uiStore'

const toastToneClass: Record<ToastVariant, string> = {
  success: 'border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--text-strong)]',
  error: 'border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--text-strong)]',
  info: 'border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--text-strong)]',
}

export function FeedbackProvider({ children }: PropsWithChildren) {
  const toasts = useUiStore((state) => state.toasts)
  const alertState = useUiStore((state) => state.alertState)
  const dismissToast = useUiStore((state) => state.dismissToast)
  const closeAlert = useUiStore((state) => state.closeAlert)

  useEffect(() => {
    if (toasts.length === 0) {
      return undefined
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), toast.duration),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [dismissToast, toasts])

  return (
    <>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex items-center px-4">
        <div className="flex w-full justify-center">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-[min(24rem,calc(100vw-2rem))] rounded-2xl border px-4 py-3 shadow-sm ${toastToneClass[toast.variant]}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--text-strong)]">
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-sm text-[var(--text-base)]">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--text-strong)]/5 hover:text-[var(--text-base)]"
              >
                닫기
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {alertState?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--danger)]">
              Alert
            </p>
            <h2 className="mt-3 text-xl font-semibold text-[var(--text-strong)]">
              {alertState.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-base)]">
              {alertState.message}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeAlert}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition hover:bg-[var(--primary-hover)]"
              >
                {alertState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
