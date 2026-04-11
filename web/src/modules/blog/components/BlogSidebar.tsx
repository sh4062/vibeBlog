// web/src/modules/blog/components/BlogSidebar.tsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/modules/blog/api/blogApi'

export default function BlogSidebar() {
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => blogApi.getTags(),
  })

  const { data: archiveData } = useQuery({
    queryKey: ['archive'],
    queryFn: () => blogApi.getArchive(),
  })

  const tags = tagsData || []
  const archive = archiveData || {}
  const years = Object.keys(archive).sort((a, b) => parseInt(b) - parseInt(a)).slice(0, 3)

  // 计算每个标签的文章数来决定字体大小
  const maxCount = Math.max(...tags.map(t => t.article_count || 0), 1)

  return (
    <aside className="space-y-6">
      {/* 搜索框 */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">搜索</h3>
        <form action="/blog/search" method="get">
          <div className="relative">
            <input
              type="text"
              name="q"
              placeholder="搜索文章..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
      </div>

      {/* 标签云 */}
      {tags.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">热门标签</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 15).map((tag) => {
              const size = Math.max(0.75, Math.min(1.25, (tag.article_count || 0) / maxCount + 0.5))
              return (
                <Link
                  key={tag.id}
                  to={`/blog?tag=${tag.slug}`}
                  className="px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 rounded-full transition-colors"
                  style={{ fontSize: `${size}rem` }}
                >
                  {tag.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* 归档 */}
      {years.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">归档</h3>
          <div className="space-y-2">
            {years.map((year) => (
              <div key={year}>
                <div className="font-medium text-gray-700 text-sm mb-1">{year} 年</div>
                <div className="pl-2 space-y-1">
                  {Object.entries(archive[year])
                    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                    .slice(0, 4)
                    .map(([month, count]) => (
                      <Link
                        key={month}
                        to={`/blog/archive/${year}/${month}`}
                        className="flex justify-between items-center py-1 px-2 text-sm text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      >
                        <span>{parseInt(month)} 月</span>
                        <span className="text-xs text-gray-400">{count} 篇</span>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
            <Link
              to="/blog/archive"
              className="block text-sm text-purple-600 hover:text-purple-700 mt-2"
            >
              查看全部 →
            </Link>
          </div>
        </div>
      )}

      {/* 关于卡片 */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-sm p-5 text-white">
        <h3 className="font-semibold mb-2">关于博主</h3>
        <p className="text-sm text-white/80 mb-3">一个热爱技术与分享的开发者</p>
        <Link
          to="/about"
          className="text-sm text-white hover:text-white/80 underline underline-offset-2"
        >
          了解更多 →
        </Link>
      </div>
    </aside>
  )
}