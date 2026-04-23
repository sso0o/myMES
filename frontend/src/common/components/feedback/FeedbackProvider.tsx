import { useEffect, type PropsWithChildren } from 'react'
import { useUiStore, type ToastVariant } from '@/store/uiStore'

const toastToneClass: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-slate-900',
  error: 'border-red-200 bg-red-50 text-slate-900',
  info: 'border-blue-200 bg-blue-50 text-slate-900',
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

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-sm ${toastToneClass[toast.variant]}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                {toast.message && <p className="text-sm text-slate-700">{toast.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-900/5 hover:text-slate-700"
              >
                닫기
              </button>
            </div>
          </div>
        ))}
      </div>

      {alertState?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-600">
              Alert
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              {alertState.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{alertState.message}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeAlert}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
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
