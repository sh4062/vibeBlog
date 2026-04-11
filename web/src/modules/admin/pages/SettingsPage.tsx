// web/src/modules/admin/pages/SettingsPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { adminApi } from '@/modules/admin/api/adminApi'
import { Editor } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github-dark.css'

const plugins = [gfm(), highlight()]

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    avatar: '',
    about_content: '',
    social_links: '',
  })

  const { data: config, isLoading } = useQuery({
    queryKey: ['adminSiteConfig'],
    queryFn: () => adminApi.getSiteConfig(),
  })

  useEffect(() => {
    if (config) {
      setForm({
        avatar: config.avatar || '',
        about_content: config.about_content || '',
        social_links: config.social_links || '',
      })
    }
  }, [config])

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => adminApi.updateSiteConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteConfig'] })
      alert('设置已保存')
    },
  })

  const handleSave = () => {
    updateMutation.mutate(form)
  }

  if (isLoading) {
    return <div className="text-white/60">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">站点设置</h1>

      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
          <label className="block text-white/60 text-sm mb-2">头像 URL</label>
          <input
            type="text"
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="https://example.com/avatar.jpg"
          />
          {form.avatar && (
            <img
              src={form.avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full mt-4"
            />
          )}
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
          <label className="block text-white/60 text-sm mb-2">关于我</label>
          <Editor
            value={form.about_content}
            plugins={plugins}
            onChange={(v) => setForm({ ...form, about_content: v })}
            mode="split"
          />
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
          <label className="block text-white/60 text-sm mb-2">社交链接 (JSON)</label>
          <textarea
            value={form.social_links}
            onChange={(e) => setForm({ ...form, social_links: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none font-mono"
            rows={4}
            placeholder='{"github": "https://github.com/...", "twitter": "https://twitter.com/..."}'
          />
        </div>

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {updateMutation.isPending ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  )
}