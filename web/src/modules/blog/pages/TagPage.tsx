// web/src/modules/blog/pages/TagPage.tsx
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/modules/blog/api/blogApi'
import TagBadge from '@/modules/blog/components/TagBadge'
import Loading from '@/shared/components/Loading'

export default function TagPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: () => blogApi.getTags(),
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  const tags = data || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">标签</h1>

      {tags.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无标签</div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} showCount />
          ))}
        </div>
      )}
    </div>
  )
}