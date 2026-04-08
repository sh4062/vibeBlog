// web/src/modules/blog/pages/ArticleDetailPage.tsx
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import MarkdownRenderer from '@/modules/blog/components/MarkdownRenderer'
import TagBadge from '@/modules/blog/components/TagBadge'
import Loading from '@/shared/components/Loading'

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => blogApi.getArticle(parseInt(id!, 10)),
    enabled: !!id,
  })

  if (isLoading) return <Loading />
  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">文章不存在</p>
        <Link to="/blog" className="text-blue-600 hover:text-blue-700">
          返回列表
        </Link>
      </div>
    )
  }

  const article = data

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
          <span>
            {article.published_at
              ? new Date(article.published_at).toLocaleDateString('zh-CN')
              : '未发布'}
          </span>
          <span>·</span>
          <span>{article.view_count} 阅读</span>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </header>

      {article.cover_image && (
        <img
          src={article.cover_image}
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}

      <MarkdownRenderer content={article.content} />
    </article>
  )
}