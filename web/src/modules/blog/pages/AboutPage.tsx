// web/src/modules/blog/pages/AboutPage.tsx
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/modules/blog/api/blogApi'
import MarkdownRenderer from '@/modules/blog/components/MarkdownRenderer'
import Loading from '@/shared/components/Loading'

export default function AboutPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: () => blogApi.getSiteConfig(),
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  const config = data

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">关于我</h1>

      {config?.avatar && (
        <img
          src={config.avatar}
          alt="Avatar"
          className="w-32 h-32 rounded-full mb-6"
        />
      )}

      {config?.about_content ? (
        <MarkdownRenderer content={config.about_content} />
      ) : (
        <p className="text-gray-500">暂无介绍</p>
      )}
    </div>
  )
}