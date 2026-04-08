// web/src/modules/blog/pages/HomePage.tsx
import { useState, useEffect } from 'react'
import DraggableGrid from '@/shared/components/DraggableGrid'
import { getModules, type ModuleConfig } from '@/config/modules'

export default function HomePage() {
  const [modules, setModules] = useState<ModuleConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getModules().then((mods) => {
      setModules(mods)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (modules.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        暂无模块
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 -m-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          我的个人主页
        </h1>
        <p className="text-white/60 text-sm">
          拖拽卡片调整布局
        </p>
      </div>

      <DraggableGrid modules={modules} />
    </div>
  )
}