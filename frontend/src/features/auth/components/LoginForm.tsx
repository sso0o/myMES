import { useState } from 'react'
import AppTextField from '@/common/components/AppTextField'
import { useLogin } from '../hooks/useLogin'

const LoginForm = () => {
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [password, setPassword] = useState('')
  const { loading, login } = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login({ employeeNumber, password })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-base)]">
          사번
        </label>
        <AppTextField
          inputMode="numeric"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          placeholder="사번을 입력하세요"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-base)]">
          비밀번호
        </label>
        <AppTextField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-[var(--primary)] py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  )
}

export default LoginForm
