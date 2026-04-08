import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from '@/layouts/MainLayout'
import LoginPage from '@/modules/auth/pages/LoginPage'
import HomePage from '@/modules/blog/pages/HomePage'
import ArticleListPage from '@/modules/blog/pages/ArticleListPage'
import ArticleDetailPage from '@/modules/blog/pages/ArticleDetailPage'
import TagPage from '@/modules/blog/pages/TagPage'
import ArchivePage from '@/modules/blog/pages/ArchivePage'
import SearchPage from '@/modules/blog/pages/SearchPage'
import AboutPage from '@/modules/blog/pages/AboutPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<ArticleListPage />} />
            <Route path="/blog/article/:id" element={<ArticleDetailPage />} />
            <Route path="/blog/tag" element={<TagPage />} />
            <Route path="/blog/tag/:slug" element={<ArticleListPage />} />
            <Route path="/blog/archive" element={<ArchivePage />} />
            <Route path="/blog/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<div className="p-8 text-2xl">管理后台（待开发）</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App