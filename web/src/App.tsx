import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from '@/modules/auth/pages/LoginPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div className="p-8 text-2xl">VibeBlog 首页</div>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<div className="p-8 text-2xl">管理后台（待开发）</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App