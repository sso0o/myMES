import LoginForm from '@/features/auth/components/LoginForm'

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-strong)]">
            MES
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">생산 실행 시스템</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
