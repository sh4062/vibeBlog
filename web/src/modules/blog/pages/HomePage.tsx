// web/src/modules/blog/pages/HomePage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import ArticleCard from '@/modules/blog/components/ArticleCard'
import Loading from '@/shared/components/Loading'

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', { page: 1, limit: 5 }],
    queryFn: () => blogApi.getArticles({ page: 1, limit: 5 }),
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  // NOTE: blogApi returns unwrapped data, so access data.articles directly
  const articles = data?.articles || []

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          欢迎来到 VibeBlog
        </h1>
        <p className="text-gray-600">
          一个简洁的个人博客，记录技术、生活与思考。
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">最新文章</h2>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">
            查看全部 →
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无文章
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}