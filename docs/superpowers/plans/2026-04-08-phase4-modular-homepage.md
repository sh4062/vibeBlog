# Phase 4: 模块化首页门户实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页从传统文章列表升级为可拖拽的模块化卡片仪表盘。

**Architecture:** 使用 dnd-kit 实现拖拽，CSS Grid 实现 Bento Grid 布局，玻璃拟态风格的卡片组件。模块通过配置文件注册，易于扩展。

**Tech Stack:** React 19, TypeScript, dnd-kit, Tailwind CSS, TanStack Query

---

## 文件结构规划

```
web/src/
├── config/
│   └── modules.ts                    # 新建 - 模块注册配置
├── shared/
│   └── components/
│       ├── ModuleCard.tsx            # 新建 - 卡片容器组件
│       └── DraggableGrid.tsx         # 新建 - 拖拽网格组件
├── modules/
│   └── blog/
│       └── cards/
│           └── BlogCard.tsx          # 新建 - 博客首页卡片
└── pages/
    └── HomePage.tsx                  # 重构 - 仪表盘页面
```

---

## Task 4.1: 安装 dnd-kit 依赖

**Files:**
- Modify: `web/package.json`

- [ ] **Step 1: 安装依赖**

```bash
cd /Users/max/Documents/code/vibeBlog/web && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: 验证安装**

```bash
npm ls @dnd-kit/core
# Expected: @dnd-kit/core@x.x.x
```

- [ ] **Step 3: Commit**

```bash
git add web/package.json web/package-lock.json
git commit -m "chore: add dnd-kit dependencies for drag and drop"
```

---

## Task 4.2: 创建模块配置

**Files:**
- Create: `web/src/config/modules.ts`

- [ ] **Step 1: 创建目录和配置文件**

```typescript
// web/src/config/modules.ts
import type { ComponentType } from 'react'

export type ModuleSize = 'small' | 'medium' | 'large'

export interface ModuleConfig {
  id: string
  name: string
  icon: string
  size: ModuleSize
  gradient: string // 背景渐变
  card: ComponentType
  detailPath: string
}

// 模块列表将在组件中导入
export const modules: ModuleConfig[] = []
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
cd /Users/max/Documents/code/vibeBlog/web && npx tsc --noEmit
# Expected: no errors
```

- [ ] **Step 3: Commit**

```bash
git add web/src/config/modules.ts
git commit -m "feat: add module configuration interface"
```

---

## Task 4.3: 创建 ModuleCard 组件

**Files:**
- Create: `web/src/shared/components/ModuleCard.tsx`

- [ ] **Step 1: 创建 ModuleCard 组件**

```tsx
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
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/web && npx tsc --noEmit
# Expected: no errors
```

- [ ] **Step 3: Commit**

```bash
git add web/src/shared/components/ModuleCard.tsx
git commit -m "feat: add ModuleCard component with glassmorphism style"
```

---

## Task 4.4: 创建 DraggableGrid 组件

**Files:**
- Create: `web/src/shared/components/DraggableGrid.tsx`

- [ ] **Step 1: 创建 DraggableGrid 组件**

```tsx
// web/src/shared/components/DraggableGrid.tsx
import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import ModuleCard from './ModuleCard'
import type { ModuleConfig } from '@/config/modules'

interface DraggableGridProps {
  modules: ModuleConfig[]
}

export default function DraggableGrid({ modules: initialModules }: DraggableGridProps) {
  const [modules, setModules] = useState(initialModules)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 需要拖动 8px 才触发
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={modules} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[120px]">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module}>
              <module.card />
            </ModuleCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/web && npx tsc --noEmit
# Expected: no errors
```

- [ ] **Step 3: Commit**

```bash
git add web/src/shared/components/DraggableGrid.tsx
git commit -m "feat: add DraggableGrid component with dnd-kit"
```

---

## Task 4.5: 创建 BlogCard 组件

**Files:**
- Create: `web/src/modules/blog/cards/BlogCard.tsx`

- [ ] **Step 1: 创建 BlogCard 组件**

```tsx
// web/src/modules/blog/cards/BlogCard.tsx
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/modules/blog/api/blogApi'

export default function BlogCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', { page: 1, limit: 5 }],
    queryFn: () => blogApi.getArticles({ page: 1, limit: 5 }),
  })

  const articles = data?.articles || []

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          <span className="font-bold text-lg">博客</span>
        </div>
        <span className="text-xs text-white/70 hover:text-white transition-colors">
          查看全部 →
        </span>
      </div>

      {/* 文章列表 */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="text-sm text-white/60">加载中...</div>
        ) : error ? (
          <div className="text-sm text-white/60">加载失败</div>
        ) : articles.length === 0 ? (
          <div className="text-sm text-white/60">暂无文章</div>
        ) : (
          <div className="space-y-2">
            {articles.slice(0, 5).map((article) => (
              <div
                key={article.id}
                className="flex justify-between items-center py-1.5 border-b border-white/10 last:border-0"
              >
                <span className="text-sm truncate flex-1 pr-2">
                  {article.title}
                </span>
                <span className="text-xs text-white/50 shrink-0">
                  {formatDate(article.published_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/web && npx tsc --noEmit
# Expected: no errors
```

- [ ] **Step 3: Commit**

```bash
git add web/src/modules/blog/cards/BlogCard.tsx
git commit -m "feat: add BlogCard component for homepage dashboard"
```

---

## Task 4.6: 更新模块配置注册 Blog

**Files:**
- Modify: `web/src/config/modules.ts`

- [ ] **Step 1: 更新配置文件**

```typescript
// web/src/config/modules.ts
import type { ComponentType } from 'react'

export type ModuleSize = 'small' | 'medium' | 'large'

export interface ModuleConfig {
  id: string
  name: string
  icon: string
  size: ModuleSize
  gradient: string
  card: ComponentType
  detailPath: string
}

// 动态导入卡片组件，避免循环依赖
let modules: ModuleConfig[] = []

export const getModules = async (): Promise<ModuleConfig[]> => {
  if (modules.length > 0) return modules

  const { default: BlogCard } = await import('@/modules/blog/cards/BlogCard')

  modules = [
    {
      id: 'blog',
      name: '博客',
      icon: '📝',
      size: 'large',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      card: BlogCard,
      detailPath: '/blog',
    },
    // 后续模块在此注册
    // {
    //   id: 'video',
    //   name: '视频',
    //   icon: '🎬',
    //   size: 'medium',
    //   gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    //   card: VideoCard,
    //   detailPath: '/video',
    // },
  ]

  return modules
}

// 同步版本，用于类型推断
export const moduleConfigs: Omit<ModuleConfig, 'card'>[] = [
  {
    id: 'blog',
    name: '博客',
    icon: '📝',
    size: 'large',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    detailPath: '/blog',
  },
]
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/web && npx tsc --noEmit
# Expected: no errors
```

- [ ] **Step 3: Commit**

```bash
git add web/src/config/modules.ts
git commit -m "feat: register BlogCard in module configuration"
```

---

## Task 4.7: 重构 HomePage 为仪表盘

**Files:**
- Modify: `web/src/modules/blog/pages/HomePage.tsx`

- [ ] **Step 1: 重写 HomePage**

```tsx
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
      {/* 页面标题 */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          我的个人主页
        </h1>
        <p className="text-white/60 text-sm">
          拖拽卡片调整布局
        </p>
      </div>

      {/* 模块网格 */}
      <DraggableGrid modules={modules} />
    </div>
  )
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/web && npx tsc --noEmit
# Expected: no errors
```

- [ ] **Step 3: Commit**

```bash
git add web/src/modules/blog/pages/HomePage.tsx
git commit -m "feat: refactor HomePage to modular dashboard"
```

---

## Task 4.8: 背景处理说明

**说明：** MainLayout 无需修改。HomePage 使用负边距 `-m-8` 实现全宽渐变背景，覆盖 MainLayout 的灰色底色。

现有 MainLayout 保持不变，背景由 HomePage 自己控制：
- HomePage 添加 `py-8 -m-8` 扩展到全宽
- 渐变背景 `bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`

**无需代码修改。**

---

## Task 4.9: 最终验证

- [ ] **Step 1: 构建前端**

```bash
cd /Users/max/Documents/code/vibeBlog/web && npm run build
# Expected: build successful
```

- [ ] **Step 2: 测试页面访问**

访问以下页面验证功能：
- 首页: http://localhost:5173/ - 应显示仪表盘，Blog 卡片可拖拽
- 博客列表: http://localhost:5173/blog - 应正常显示文章列表
- 点击 Blog 卡片 - 应跳转到 /blog

- [ ] **Step 3: 测试拖拽功能**

1. 首页显示 Blog 卡片
2. 鼠标悬停显示拖拽句柄（右上角六个点）
3. 按住句柄可拖动卡片
4. 释放后卡片位置改变

- [ ] **Step 4: Final Commit**

```bash
git add -A
git commit -m "feat: complete Phase 4 - modular homepage dashboard"
```

---

## 验收标准

- [ ] 首页显示玻璃拟态风格的 Blog 卡片
- [ ] Blog 卡片显示最新 5 篇文章
- [ ] 卡片可拖拽重排
- [ ] 点击卡片跳转到 /blog
- [ ] /blog 页面保持原有功能
- [ ] 前端构建无错误