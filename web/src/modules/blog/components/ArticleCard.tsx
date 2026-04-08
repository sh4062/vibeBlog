// web/src/modules/blog/components/ArticleCard.tsx
import { Link } from 'react-router-dom'
import type { Article } from '@/shared/types/models'
import TagBadge from './TagBadge'

interface Props {
  article: Article
}

export default function ArticleCard({ article }: Props) {
  return (
    <article className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <Link to={`/blog/article/${article.id}`}>
        <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
          {article.title}
        </h2>
      </Link>

      <div className="flex flex-wrap gap-2 mb-3">
        {article.tags?.map((tag) => (
          <TagBadge key={tag.id} tag={tag} />
        ))}
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">
        {article.summary}
      </p>

      <div className="flex items-center text-sm text-gray-500">
        <span>
          {article.published_at
            ? new Date(article.published_at).toLocaleDateString('zh-CN')
            : '未发布'}
        </span>
        <span className="mx-2">·</span>
        <span>{article.view_count} 阅读</span>
      </div>
    </article>
  )
}