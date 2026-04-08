// web/src/shared/components/ModuleCard.tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import type { ModuleConfig } from '@/config/modules'

interface ModuleCardProps {
  module: ModuleConfig
  children: React.ReactNode
}

export default function ModuleCard({ module, children }: ModuleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // 根据尺寸计算 grid span
  const gridSpan = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${gridSpan[module.size]} min-h-[120px]`}
    >
      <Link
        to={module.detailPath}
        className="block h-full"
      >
        <div
          className="h-full rounded-2xl p-5 text-white relative overflow-hidden group cursor-pointer"
          style={{ background: module.gradient }}
        >
          {/* 玻璃拟态叠加层 */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20" />

          {/* 拖拽句柄 */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-3 right-3 p-1 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.preventDefault()}
          >
            <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
          </div>

          {/* 内容区域 */}
          <div className="relative z-0">
            {children}
          </div>
        </div>
      </Link>
    </div>
  )
}