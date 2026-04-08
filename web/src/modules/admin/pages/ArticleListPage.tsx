// web/src/modules/admin/pages/ArticleListPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { adminApi } from '@/modules/admin/api/adminApi'

export default function ArticleListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const page = parseInt(searchParams.get('page') || '1', 10)
  const status = searchParams.get('status') || ''
  const keyword = searchParams.get('keyword') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['adminArticles', { page, status, keyword }],
    queryFn: () => adminApi.getArticles({ page, limit: 10, status, keyword }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] })
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id: number) => adminApi.publishArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] })
    },
  })

  const articles = data?.data?.data?.data || []
  const pagination = data?.data?.data?.pagination

  const handleDelete = (id: number) => {
    if (confirm('确定删除这篇文章？')) {
      deleteMutation.mutate(id)
    }
  }

  const handlePublish = (id: number) => {
    publishMutation.mutate(id)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">文章管理</h1>
        <Link
          to="/admin/articles/new"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          新建文章
        </Link>
      </div>

      {/* 筛选 */}
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="搜索标题..."
            value={keyword}
            onChange={(e) => setSearchParams({ page: '1', status, keyword: e.target.value })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
          />
          <select
            value={status}
            onChange={(e) => setSearchParams({ page: '1', status: e.target.value, keyword })}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-white/60">加载中...</div>
        ) : articles.length === 0 ? (
          <div className="p-6 text-white/60 text-center">暂无文章</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-white/60 font-medium">标题</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">状态</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">标签</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">阅读量</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">发布时间</th>
                <th className="px-4 py-3 text-right text-white/60 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-white/10 last:border-0">
                  <td className="px-4 py-3 text-white">{article.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        article.status === 'published'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {article.tags?.slice(0, 3).map((tag) => (
                        <span key={tag.id} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                          {tag.name}
                        </span>
                      ))}
                      {article.tags?.length > 3 && (
                        <span className="text-white/40 text-xs">+{article.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{article.view_count}</td>
                  <td className="px-4 py-3 text-white/60">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('zh-CN')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {article.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(article.id)}
                          className="px-2 py-1 text-green-400 hover:text-green-300 text-sm"
                        >
                          发布
                        </button>
                      )}
                      <Link
                        to={`/admin/articles/${article.id}/edit`}
                        className="px-2 py-1 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="px-2 py-1 text-red-400 hover:text-red-300 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setSearchParams({ page: p.toString(), status, keyword })}
              className={`px-3 py-1 rounded ${
                p === page
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}