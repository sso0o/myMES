import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import router from './router'
import { FeedbackProvider } from './common/components/feedback/FeedbackProvider'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FeedbackProvider>
        <RouterProvider router={router} />
      </FeedbackProvider>
    </QueryClientProvider>
  )
}

export default App
