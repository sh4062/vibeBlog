// web/src/modules/blog/pages/ArchivePage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import Loading from '@/shared/components/Loading'

export default function ArchivePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['archive'],
    queryFn: () => blogApi.getArchive(),
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  const archive = data || {}
  const years = Object.keys(archive).sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">归档</h1>

      {years.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无文章</div>
      ) : (
        <div className="space-y-8">
          {years.map((year) => (
            <div key={year}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{year} 年</h2>
              <div className="space-y-2 pl-4">
                {Object.entries(archive[year])
                  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                  .map(([month, count]) => (
                    <Link
                      key={month}
                      to={`/blog/archive/${year}/${month}`}
                      className="flex justify-between items-center p-3 bg-white rounded border hover:bg-gray-50"
                    >
                      <span>{parseInt(month)} 月</span>
                      <span className="text-gray-500">{count} 篇</span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}