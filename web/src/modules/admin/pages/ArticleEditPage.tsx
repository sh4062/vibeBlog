// web/src/modules/admin/pages/ArticleEditPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { adminApi } from '@/modules/admin/api/adminApi'
import { Editor } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github-dark.css'
import type { Tag } from '@/shared/types/models'

const plugins = [gfm(), highlight()]

export default function ArticleEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [form, setForm] = useState<{
    title: string
    slug: string
    summary: string
    content: string
    cover_image: string
    status: string
    tag_ids: number[]
  }>({
    title: '',
    slug: '',
    summary: '',
    content: '',
    cover_image: '',
    status: 'draft',
    tag_ids: [],
  })

  // 获取文章详情（编辑模式）
  const { data: article } = useQuery({
    queryKey: ['adminArticle', id],
    queryFn: () => adminApi.getArticle(parseInt(id!, 10)),
    enabled: isEdit,
  })

  // 获取标签列表
  const { data: tags } = useQuery({
    queryKey: ['adminTags'],
    queryFn: () => adminApi.getTags(),
  })

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title,
        slug: article.slug,
        summary: article.summary || '',
        content: article.content || '',
        cover_image: article.cover_image || '',
        status: article.status || 'draft',
        tag_ids: article.tags?.map((t: Tag) => t.id) || [],
      })
    }
  }, [article])

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => adminApi.createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] })
      navigate('/admin/articles')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => adminApi.updateArticle(parseInt(id!, 10), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] })
      navigate('/admin/articles')
    },
  })

  const handleSubmit = (status: 'draft' | 'published') => {
    const data = { ...form, status }
    if (isEdit) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? '编辑文章' : '新建文章'}
        </h1>
        <Link
          to="/admin/articles"
          className="text-white/60 hover:text-white"
        >
          返回列表
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 主内容 */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
            <label className="block text-white/60 text-sm mb-2">标题 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="文章标题"
            />
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
            <label className="block text-white/60 text-sm mb-2">摘要</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
              rows={3}
              placeholder="文章摘要"
            />
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
            <label className="block text-white/60 text-sm mb-2">正文内容</label>
            <Editor
              value={form.content}
              plugins={plugins}
              onChange={(v) => setForm({ ...form, content: v })}
              mode="split"
            />
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
            <label className="block text-white/60 text-sm mb-2">URL Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="article-slug"
            />
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
            <label className="block text-white/60 text-sm mb-2">封面图</label>
            <input
              type="text"
              value={form.cover_image}
              onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="https://..."
            />
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
            <label className="block text-white/60 text-sm mb-2">标签</label>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag: Tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    const tagIds = form.tag_ids.includes(tag.id)
                      ? form.tag_ids.filter((id) => id !== tag.id)
                      : [...form.tag_ids, tag.id]
                    setForm({ ...form, tag_ids: tagIds })
                  }}
                  className={`px-2 py-1 rounded text-sm ${
                    form.tag_ids.includes(tag.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 space-y-2">
            <button
              onClick={() => handleSubmit('published')}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              发布
            </button>
            <button
              onClick={() => handleSubmit('draft')}
              className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              保存草稿
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}