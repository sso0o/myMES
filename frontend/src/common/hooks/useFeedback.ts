import { useUiStore, type AlertInput, type ToastInput } from '@/store/uiStore'

interface UseFeedbackResult {
  showToast: (input: ToastInput) => void
  showAlert: (input: AlertInput) => Promise<boolean>
}

export function useFeedback(): UseFeedbackResult {
  const showToast = useUiStore((state) => state.showToast)
  const showAlert = useUiStore((state) => state.showAlert)

  return {
    showToast,
    showAlert,
  }
}
