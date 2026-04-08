// web/src/modules/blog/pages/SearchPage.tsx
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import ArticleCard from '@/modules/blog/components/ArticleCard'
import Loading from '@/shared/components/Loading'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('q') || ''

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', keyword],
    queryFn: () => blogApi.search({ q: keyword, limit: 20 }),
    enabled: keyword.length > 0,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        搜索: {keyword || '(请输入关键词)'}
      </h1>

      {!keyword && (
        <div className="text-center py-12 text-gray-500">
          请输入搜索关键词
        </div>
      )}

      {keyword && isLoading && <Loading />}

      {keyword && error && (
        <div className="text-red-500">搜索失败</div>
      )}

      {keyword && data && (
        <>
          {data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              未找到相关文章
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}