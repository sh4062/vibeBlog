import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import LoginPage from '@/modules/auth/pages/LoginPage'
import HomePage from '@/modules/blog/pages/HomePage'
import ArticleListPage from '@/modules/blog/pages/ArticleListPage'
import ArticleDetailPage from '@/modules/blog/pages/ArticleDetailPage'
import TagPage from '@/modules/blog/pages/TagPage'
import ArchivePage from '@/modules/blog/pages/ArchivePage'
import ArchiveMonthPage from '@/modules/blog/pages/ArchiveMonthPage'
import SearchPage from '@/modules/blog/pages/SearchPage'
import AboutPage from '@/modules/blog/pages/AboutPage'
import DashboardPage from '@/modules/admin/pages/DashboardPage'
import ArticleListPageAdmin from '@/modules/admin/pages/ArticleListPage'
import ArticleEditPage from '@/modules/admin/pages/ArticleEditPage'
import TagManagePage from '@/modules/admin/pages/TagManagePage'
import SettingsPage from '@/modules/admin/pages/SettingsPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 前台 */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<ArticleListPage />} />
            <Route path="/blog/article/:id" element={<ArticleDetailPage />} />
            <Route path="/blog/tag" element={<TagPage />} />
            <Route path="/blog/tag/:slug" element={<ArticleListPage />} />
            <Route path="/blog/archive" element={<ArchivePage />} />
            <Route path="/blog/archive/:year/:month" element={<ArchiveMonthPage />} />
            <Route path="/blog/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          {/* 登录 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 管理后台 */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/articles" element={<ArticleListPageAdmin />} />
            <Route path="/admin/articles/new" element={<ArticleEditPage />} />
            <Route path="/admin/articles/:id/edit" element={<ArticleEditPage />} />
            <Route path="/admin/tags" element={<TagManagePage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App