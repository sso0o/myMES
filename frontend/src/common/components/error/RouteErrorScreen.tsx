import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

interface ErrorDetail {
  message: string
  stack?: string
}

const getErrorDetail = (error: unknown): ErrorDetail => {
  if (isRouteErrorResponse(error)) {
    return {
      message: `${error.status} ${error.statusText}`,
      stack: typeof error.data === 'string' ? error.data : undefined,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    }
  }

  if (typeof error === 'string') {
    return { message: error }
  }

  return { message: '알 수 없는 오류가 발생했습니다.' }
}

const RouteErrorScreen = () => {
  const error = useRouteError()
  const errorDetail = getErrorDetail(error)
  const showDetail = import.meta.env.DEV

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--text-base)]">
      <section className="w-full max-w-xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <p className="text-sm font-semibold text-[var(--danger)]">Application Error</p>
        <h1 className="mt-3 text-2xl font-bold text-[var(--text-strong)]">
          화면을 불러오지 못했습니다.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          일시적인 오류가 발생했습니다. 새로고침 후에도 문제가 계속되면 이전 화면으로 돌아가
          다시 시도해주세요.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReload}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            새로고침
          </button>
          <Link
            to="/"
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-base)] transition-colors hover:bg-[var(--surface-alt)]"
          >
            홈으로 이동
          </Link>
        </div>

        {showDetail && (
          <details className="mt-6 rounded-md border border-[var(--border)] bg-[var(--surface-alt)] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--text-base)]">
              개발자 오류 상세
            </summary>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-[var(--text-muted)]">
              {errorDetail.stack ?? errorDetail.message}
            </pre>
          </details>
        )}
      </section>
    </div>
  )
}

export default RouteErrorScreen
