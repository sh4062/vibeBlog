// web/src/modules/blog/pages/ArticleListPage.tsx
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import ArticleCard from '@/modules/blog/components/ArticleCard'
import BlogSidebar from '@/modules/blog/components/BlogSidebar'
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
  if (error) return <div className="text-red-500 text-center py-12">加载失败</div>

  const articles = data?.articles || []
  const pagination = data?.pagination
  const firstArticle = articles[0]

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        {tag ? (
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              #{tag}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">标签文章</h1>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">博客文章</h1>
            <p className="text-gray-500">探索技术、分享思考、记录成长</p>
          </div>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">暂无文章</h3>
          <p className="text-gray-500">敬请期待更多内容</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 文章列表 */}
          <div className="flex-1">
            {/* 特色文章（第一篇） */}
            {page === 1 && firstArticle && (
              <div className="mb-6">
                <ArticleCard article={firstArticle} featured />
              </div>
            )}

            {/* 其余文章 */}
            <div className="space-y-4">
              {(page === 1 ? articles.slice(1) : articles).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* 分页 */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8">
                <Pagination
                  current={pagination.page}
                  total={pagination.pages}
                  baseUrl={tag ? `/blog?tag=${tag}` : '/blog'}
                />
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="lg:w-72 shrink-0">
            <BlogSidebar />
          </div>
        </div>
      )}
    </div>
  )
}