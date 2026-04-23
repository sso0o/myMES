import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFeedback } from '@/common/hooks/useFeedback'
import { useAuthStore } from '@/store/authStore'
import type { LoginFormValues } from '../types'

interface UseLoginResult {
  loading: boolean
  login: (values: LoginFormValues) => Promise<void>
}

export function useLogin(): UseLoginResult {
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuthStore()
  const { showAlert, showToast } = useFeedback()
  const navigate = useNavigate()

  const login = async ({ employeeNumber, password }: LoginFormValues) => {
    setLoading(true)

    try {
      await signIn(employeeNumber, password)
      showToast({
        title: '로그인되었습니다.',
        message: '대시보드로 이동합니다.',
        variant: 'success',
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      await showAlert({
        title: '로그인 실패',
        message: err instanceof Error ? err.message : '로그인에 실패했습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    login,
  }
}
