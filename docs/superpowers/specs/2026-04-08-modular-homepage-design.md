# 模块化首页门户设计文档

> **日期**: 2026-04-08
> **状态**: 设计确认，待实现

## 概述

将 VibeBlog 首页从传统文章列表升级为**模块化卡片仪表盘**，支持拖拽调整布局，为后续模块扩展（视频直播、项目展示等）预留架构。

## 设计决策

| 决策项 | 选择 | 理由 |
|---|---|---|
| 布局方式 | Bento Grid | 现代感强，卡片大小不一，视觉层次丰富 |
| 卡片尺寸 | 固定档位 | 简化实现，模块开发者决定 |
| Blog卡片内容 | 文章列表（3-5篇） | 信息密度高，内容为主 |
| 视觉风格 | 玻璃拟态 Glassmorphism | 高级感，iOS/macOS 风格 |
| 拖拽库 | dnd-kit | 现代、轻量、React 18 友好 |
| 模块注册 | 硬编码配置 | 简单直接，适合当前规模 |
| 位置存储 | 不存储 | 刷新恢复默认，简化实现 |

## 卡片规格

### 尺寸档位

```
Grid: 4列 x 自适应行
单元格: 1单位 = 80px 高度，列宽自适应

Small  (1x1): 1列 x 1行 = 统计、快捷入口
Medium (2x1): 2列 x 1行 = 列表预览
Large  (2x2): 2列 x 2行 = 主模块卡片
```

### 初始布局

```
+------------------+----+----+
|                  | S1 | S2 |
|    Blog (L)      +----+----+
|                  |   M1    |
+------------------+---------+
|       M2         |   M3    |
+------------------+---------+

L = Large (2x2), M = Medium (2x1), S = Small (1x1)
```

## 视觉规范

### 玻璃拟态卡片

```css
.card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

### 模块主题色

| 模块 | 主题色 | 渐变背景 |
|---|---|---|
| Blog | 紫蓝 | `linear-gradient(135deg, #667eea, #764ba2)` |
| 视频 | 红 | `linear-gradient(135deg, #f093fb, #f5576c)` |
| 项目 | 绿 | `linear-gradient(135deg, #4facfe, #00f2fe)` |
| 关于 | 灰白 | 纯色/白色 |

## 架构设计

### 前端文件结构

```
web/src/
├── modules/
│   ├── blog/
│   │   ├── cards/                    # 新增
│   │   │   └── BlogCard.tsx          # 博客首页卡片
│   │   └── ...
│   └── ...
├── shared/
│   ├── components/
│   │   ├── ModuleCard.tsx            # 新增：卡片容器组件
│   │   └── DraggableGrid.tsx         # 新增：拖拽网格组件
│   └── ...
├── config/
│   └── modules.ts                    # 新增：模块注册配置
└── pages/
    └── HomePage.tsx                  # 重构：仪表盘页面
```

### 模块注册配置

```typescript
// web/src/config/modules.ts
import type { ComponentType } from 'react'

export interface ModuleConfig {
  id: string
  name: string
  icon: string
  size: 'small' | 'medium' | 'large'
  gridColumn: number  // 1-4
  gridRow: number     // 起始行
  card: ComponentType
  detailPath: string  // 点击进入的完整页面路径
}

import BlogCard from '@/modules/blog/cards/BlogCard'

export const modules: ModuleConfig[] = [
  {
    id: 'blog',
    name: '博客',
    icon: '📝',
    size: 'large',
    gridColumn: 1,
    gridRow: 1,
    card: BlogCard,
    detailPath: '/blog',
  },
  // 后续模块在此注册
  // { id: 'video', name: '视频', ... },
]
```

### 组件设计

#### DraggableGrid

负责整体网格布局和拖拽逻辑。

```typescript
interface DraggableGridProps {
  modules: ModuleConfig[]
}

// 使用 dnd-kit 的 DndContext, useSortable
// CSS Grid 实现布局
// 支持拖拽重排
```

#### ModuleCard

通用卡片容器，提供玻璃拟态样式。

```typescript
interface ModuleCardProps {
  module: ModuleConfig
  children: React.ReactNode
}

// 提供：
// - 玻璃拟态背景
// - 模块标题栏
// - 拖拽句柄
// - 点击跳转到详情页
```

#### BlogCard

博客模块的首页卡片内容。

```typescript
// 显示最新 3-5 篇文章
// 使用现有的 blogApi.getArticles
// 文章标题 + 发布时间
// 底部"查看全部"链接
```

### 页面流程

```
HomePage.tsx
├── DraggableGrid
│   ├── ModuleCard (Blog)
│   │   └── BlogCard
│   ├── ModuleCard (占位模块)
│   └── ...
└── 背景（渐变或纯色）
```

## API 需求

复用现有 API，无需新增：

- `GET /api/blog/articles?page=1&limit=5` - 获取首页博客卡片内容

## 实现任务

### Phase 4: 模块化首页

1. **安装依赖** - dnd-kit
2. **创建配置** - modules.ts 模块注册
3. **创建组件** - ModuleCard, DraggableGrid
4. **创建 BlogCard** - 博客首页卡片
5. **重构 HomePage** - 改为仪表盘布局
6. **调整路由** - 保持 /blog 完整页面
7. **样式调整** - 玻璃拟态、背景渐变
8. **测试验证** - 拖拽功能、页面跳转

## 兼容性

- 现有 `/blog` 路由保持不变，作为博客完整页面
- 首页 `/` 改为仪表盘
- 所有现有 API 保持不变
- 后续新增模块只需：创建卡片组件 → 注册到 modules.ts

## 后续扩展

### 添加新模块示例（视频直播）

```typescript
// 1. 创建卡片组件
// web/src/modules/video/cards/VideoCard.tsx

// 2. 注册到配置
import VideoCard from '@/modules/video/cards/VideoCard'

export const modules = [
  { id: 'blog', ... },
  { id: 'video', name: '视频', icon: '🎬', size: 'medium', ... },
]
```

### 可扩展点（未来）

- 用户自定义布局存储（localStorage/后端）
- 卡片尺寸用户可调
- 动态模块加载
- 模块市场/插件系统