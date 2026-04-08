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

// Module cache
let modulesCache: ModuleConfig[] = []

// Async loader for modules (avoids circular deps)
export const getModules = async (): Promise<ModuleConfig[]> => {
  if (modulesCache.length > 0) return modulesCache

  // Dynamic import to avoid circular dependencies
  const { default: BlogCard } = await import('@/modules/blog/cards/BlogCard')

  modulesCache = [
    {
      id: 'blog',
      name: '博客',
      icon: '📝',
      size: 'large',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      card: BlogCard,
      detailPath: '/blog',
    },
    // Future modules will be added here:
    // { id: 'video', name: '视频', icon: '🎬', size: 'medium', ... },
  ]

  return modulesCache
}

// Static config for type inference (without card component)
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