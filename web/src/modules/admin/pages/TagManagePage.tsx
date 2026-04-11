// web/src/modules/admin/pages/TagManagePage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminApi } from '@/modules/admin/api/adminApi'
import type { Tag } from '@/shared/types/models'

interface TagModalProps {
  tag?: Tag
  onClose: () => void
  onSave: (data: { name: string; slug?: string; description?: string }) => void
}

function TagModal({ tag, onClose, onSave }: TagModalProps) {
  const [form, setForm] = useState({
    name: tag?.name || '',
    slug: tag?.slug || '',
    description: tag?.description || '',
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/20">
        <h2 className="text-lg font-semibold text-white mb-4">
          {tag ? '编辑标签' : '新建标签'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">标签名 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            保存
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TagManagePage() {
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; tag?: Tag }>({ open: false })

  const { data, isLoading } = useQuery({
    queryKey: ['adminTags'],
    queryFn: () => adminApi.getTags(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug?: string; description?: string }) =>
      adminApi.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTags'] })
      setModal({ open: false })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; slug?: string; description?: string } }) =>
      adminApi.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTags'] })
      setModal({ open: false })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTags'] })
    },
  })

  const tags = data || []

  const handleSave = (data: { name: string; slug?: string; description?: string }) => {
    if (modal.tag) {
      updateMutation.mutate({ id: modal.tag.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('确定删除这个标签？')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">标签管理</h1>
        <button
          onClick={() => setModal({ open: true })}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          新建标签
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-white/60">加载中...</div>
        ) : tags.length === 0 ? (
          <div className="p-6 text-white/60 text-center">暂无标签</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-white/60 font-medium">名称</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Slug</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">描述</th>
                <th className="px-4 py-3 text-right text-white/60 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-white/10 last:border-0">
                  <td className="px-4 py-3 text-white">{tag.name}</td>
                  <td className="px-4 py-3 text-white/60">{tag.slug}</td>
                  <td className="px-4 py-3 text-white/60">{tag.description || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setModal({ open: true, tag })}
                      className="px-2 py-1 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="px-2 py-1 text-red-400 hover:text-red-300 text-sm ml-2"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal.open && (
        <TagModal
          tag={modal.tag}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}
    </div>
  )
}