import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div className="p-8 text-2xl">VibeBlog 前端启动成功</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App