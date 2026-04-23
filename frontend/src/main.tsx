import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './store/authStore.ts'
import { StartupErrorScreen } from './common/components/error/StartupErrorScreen.tsx'
import { AppBootstrapError } from './lib/config.ts'

const root = createRoot(document.getElementById('root')!)

async function bootstrap() {
  try {
    await useAuthStore.getState().initialize()

    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error) {
    const message =
      error instanceof AppBootstrapError
        ? error.message
        : '앱 시작 중 알 수 없는 오류가 발생했습니다. 콘솔 로그를 확인해 주세요.'

    root.render(<StartupErrorScreen message={message} />)
  }
}

void bootstrap()
