// web/src/modules/blog/components/ArticleCard.tsx
import { Link } from 'react-router-dom'
import type { Article } from '@/shared/types/models'
import TagBadge from './TagBadge'

interface Props {
  article: Article
  featured?: boolean
}

export default function ArticleCard({ article, featured = false }: Props) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays} 天前`
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  }

  if (featured) {
    // 特色文章卡片（大图）
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300">
        {article.cover_image ? (
          <Link to={`/blog/article/${article.id}`} className="block">
            <div className="aspect-[2/1] overflow-hidden">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags?.slice(0, 3).map((tag) => (
                  <span key={tag.id} className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                    {tag.name}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                {article.title}
              </h2>
              <p className="text-white/80 line-clamp-2 mb-3">{article.summary}</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>{formatDate(article.published_at)}</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {article.view_count}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="aspect-[2/1] bg-gradient-to-br from-purple-500 to-pink-500">
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.tags?.slice(0, 3).map((tag) => (
                    <span key={tag.id} className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                      {tag.name}
                    </span>
                  ))}
                </div>
                <Link to={`/blog/article/${article.id}`}>
                  <h2 className="text-2xl font-bold text-white mb-2 hover:text-purple-200 transition-colors">
                    {article.title}
                  </h2>
                </Link>
                <p className="text-white/80 line-clamp-2">{article.summary}</p>
              </div>
            </div>
          </div>
        )}
      </article>
    )
  }

  // 普通文章卡片
  return (
    <article className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* 封面图 */}
        {article.cover_image && (
          <Link to={`/blog/article/${article.id}`} className="sm:w-48 shrink-0">
            <div className="aspect-[16/9] sm:aspect-square overflow-hidden">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        )}
        {/* 内容 */}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap gap-2 mb-2">
            {article.tags?.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
          <Link to={`/blog/article/${article.id}`}>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
              {article.title}
            </h2>
          </Link>
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{article.summary}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(article.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.view_count}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}