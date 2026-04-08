// web/src/modules/blog/cards/BlogCard.tsx
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/modules/blog/api/blogApi'

export default function BlogCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', { page: 1, limit: 5 }],
    queryFn: () => blogApi.getArticles({ page: 1, limit: 5 }),
  })

  const articles = data?.articles || []

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          <span className="font-bold text-lg">博客</span>
        </div>
        <span className="text-xs text-white/70 hover:text-white transition-colors">
          查看全部 →
        </span>
      </div>

      {/* 文章列表 */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="text-sm text-white/60">加载中...</div>
        ) : error ? (
          <div className="text-sm text-white/60">加载失败</div>
        ) : articles.length === 0 ? (
          <div className="text-sm text-white/60">暂无文章</div>
        ) : (
          <div className="space-y-2">
            {articles.slice(0, 5).map((article) => (
              <div
                key={article.id}
                className="flex justify-between items-center py-1.5 border-b border-white/10 last:border-0"
              >
                <span className="text-sm truncate flex-1 pr-2">
                  {article.title}
                </span>
                <span className="text-xs text-white/50 shrink-0">
                  {formatDate(article.published_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}