import request from '@/shared/utils/request'
import type { ApiResponse } from '@/shared/types/api'
import type { AssistantConfig } from '@/shared/types/assistant'

export const adminAssistantApi = {
  getConfig: async () => {
    const res = await request.get<ApiResponse<AssistantConfig>>('/admin/assistant')
    return res.data.data
  },

  updateConfig: async (data: Partial<AssistantConfig>) => {
    const res = await request.put<ApiResponse<AssistantConfig>>('/admin/assistant', data)
    return res.data.data
  },

  testConnection: async (data: Partial<AssistantConfig>) => {
    const res = await request.post<ApiResponse<{ success: boolean; message: string; reply?: string }>>(
      '/admin/assistant/test',
      data,
      { timeout: 30000 },
    )
    return res.data.data
  },

  uploadModel: async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      // webkitRelativePath 保留目录结构（如 "FolderName/sub/file.png"）
      // 去掉顶层文件夹名，只保留内部相对路径
      const relativePath = (file as any).webkitRelativePath as string | undefined
      if (relativePath) {
        const parts = relativePath.split('/')
        // 去掉第一层目录名（用户选择的文件夹本身）
        const innerPath = parts.slice(1).join('/')
        formData.append('files', file, innerPath || file.name)
      } else {
        formData.append('files', file)
      }
    })
    const res = await request.post<ApiResponse<{ path: string; files: number }>>(
      '/admin/assistant/upload-model',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 },
    )
    return res.data.data
  },
}
