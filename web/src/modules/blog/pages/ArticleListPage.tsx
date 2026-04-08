// web/src/modules/blog/pages/ArticleListPage.tsx
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import ArticleCard from '@/modules/blog/components/ArticleCard'
import Pagination from '@/modules/blog/components/Pagination'
import Loading from '@/shared/components/Loading'

export default function ArticleListPage() {
  const [searchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const tag = searchParams.get('tag') || undefined

  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', { page, limit: 10, tag }],
    queryFn: () => blogApi.getArticles({ page, limit: 10, tag }),
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  // NOTE: blogApi returns unwrapped ArticleListResult, so access data directly
  const articles = data?.articles || []
  const pagination = data?.pagination

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {tag ? `标签: ${tag}` : '全部文章'}
      </h1>

      {articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无文章
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {pagination && (
            <Pagination
              current={pagination.page}
              total={pagination.pages}
              baseUrl={tag ? `/blog?tag=${tag}` : '/blog'}
            />
          )}
        </>
      )}
    </div>
  )
}