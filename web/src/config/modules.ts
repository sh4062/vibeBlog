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