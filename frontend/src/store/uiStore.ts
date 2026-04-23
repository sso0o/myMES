import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastInput {
  title: string
  message?: string
  variant?: ToastVariant
  duration?: number
}

export interface ToastItem {
  id: number
  title: string
  message?: string
  variant: ToastVariant
  duration: number
}

export interface AlertInput {
  title: string
  message: string
  confirmText?: string
}

interface AlertState {
  open: boolean
  title: string
  message: string
  confirmText: string
}

interface UiState {
  toasts: ToastItem[]
  alertState: AlertState | null
  nextToastId: number
  alertResolver: (() => void) | null
  showToast: (input: ToastInput) => void
  dismissToast: (id: number) => void
  showAlert: (input: AlertInput) => Promise<void>
  closeAlert: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  alertState: null,
  nextToastId: 1,
  alertResolver: null,

  showToast: (input) => {
    const id = get().nextToastId
    const toast: ToastItem = {
      id,
      title: input.title,
      message: input.message,
      variant: input.variant ?? 'info',
      duration: input.duration ?? 3000,
    }

    set((state) => ({
      toasts: [...state.toasts, toast],
      nextToastId: state.nextToastId + 1,
    }))
  },

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  showAlert: (input) =>
    new Promise<void>((resolve) => {
      set({
        alertState: {
          open: true,
          title: input.title,
          message: input.message,
          confirmText: input.confirmText ?? '확인',
        },
        alertResolver: resolve,
      })
    }),

  closeAlert: () => {
    const resolver = get().alertResolver
    set({
      alertState: null,
      alertResolver: null,
    })
    resolver?.()
  },
}))
