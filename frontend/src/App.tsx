import { RouterProvider } from 'react-router-dom'
import router from './router'
import { FeedbackProvider } from './common/components/feedback/FeedbackProvider'

function App() {
  return (
    <FeedbackProvider>
      <RouterProvider router={router} />
    </FeedbackProvider>
  )
}

export default App
