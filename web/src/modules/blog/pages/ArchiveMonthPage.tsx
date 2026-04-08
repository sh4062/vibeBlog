import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import ArticleCard from '@/modules/blog/components/ArticleCard'
import Loading from '@/shared/components/Loading'

export default function ArchiveMonthPage() {
  const { year, month } = useParams<{ year: string; month: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['archive', year, month],
    queryFn: () => blogApi.getArchiveByMonth(parseInt(year!, 10), parseInt(month!, 10)),
    enabled: !!year && !!month,
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  // NOTE: blogApi returns unwrapped data
  const articles = data || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {year} 年 {parseInt(month!)} 月的文章
      </h1>

      {articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">该月份暂无文章</div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}