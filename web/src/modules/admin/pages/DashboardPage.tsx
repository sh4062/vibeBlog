// web/src/modules/admin/pages/DashboardPage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '@/modules/admin/api/adminApi'
import StatsCard from '@/modules/admin/components/StatsCard'

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApi.getStats(),
  })

  const { data: articlesData } = useQuery({
    queryKey: ['adminArticles', { page: 1, limit: 5 }],
    queryFn: () => adminApi.getArticles({ page: 1, limit: 5 }),
  })

  const stats = statsData?.data?.data
  const recentArticles = articlesData?.data?.data?.data || []

  if (statsLoading) {
    return <div className="text-white/60">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">仪表盘</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title="文章总数" value={stats?.total_articles || 0} icon="📝" color="text-purple-400" />
        <StatsCard title="已发布" value={stats?.published || 0} icon="✅" color="text-green-400" />
        <StatsCard title="草稿" value={stats?.drafts || 0} icon="📄" color="text-amber-400" />
        <StatsCard title="总阅读量" value={stats?.total_views || 0} icon="👁️" color="text-blue-400" />
      </div>

      {/* 最近文章 */}
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">最近文章</h2>
          <Link to="/admin/articles" className="text-sm text-white/60 hover:text-white">
            查看全部 →
          </Link>
        </div>
        {recentArticles.length === 0 ? (
          <p className="text-white/40">暂无文章</p>
        ) : (
          <div className="space-y-3">
            {recentArticles.map((article) => (
              <div key={article.id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      article.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {article.status === 'published' ? '已发布' : '草稿'}
                  </span>
                  <Link
                    to={`/admin/articles/${article.id}/edit`}
                    className="text-white hover:text-purple-400"
                  >
                    {article.title}
                  </Link>
                </div>
                <span className="text-white/40 text-sm">
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString('zh-CN')
                    : '-'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 快捷操作 */}
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">快捷操作</h2>
        </div>
        <div className="flex gap-4">
          <Link
            to="/admin/articles/new"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            新建文章
          </Link>
          <Link
            to="/admin/tags"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            管理标签
          </Link>
        </div>
      </div>
    </div>
  )
}