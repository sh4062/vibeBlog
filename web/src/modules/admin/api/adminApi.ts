// web/src/modules/admin/api/adminApi.ts
import request from '@/shared/utils/request'
import type { Article, Tag } from '@/shared/types/models'
import type { ApiResponse } from '@/shared/types/api'

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface PagedResponse<T> {
  data: T[]
  pagination: Pagination
}

interface Stats {
  total_articles: number
  published: number
  drafts: number
  total_views: number
}

interface ArticleInput {
  title: string
  slug?: string
  summary?: string
  content?: string
  cover_image?: string
  status?: string
  tag_ids?: number[]
}

interface TagInput {
  name: string
  slug?: string
  description?: string
}

export const adminApi = {
  // 统计
  getStats: async () => {
    const res = await request.get<ApiResponse<Stats>>('/admin/stats')
    return res.data.data
  },

  // 文章管理
  getArticles: async (params: { page?: number; limit?: number; status?: string; keyword?: string }) => {
    const res = await request.get<ApiResponse<PagedResponse<Article>>>('/admin/articles', { params })
    return res.data.data
  },

  getArticle: async (id: number) => {
    const res = await request.get<ApiResponse<Article>>(`/admin/articles/${id}`)
    return res.data.data
  },

  createArticle: async (data: ArticleInput) => {
    const res = await request.post<ApiResponse<Article>>('/admin/articles', data)
    return res.data.data
  },

  updateArticle: async (id: number, data: ArticleInput) => {
    const res = await request.put<ApiResponse<Article>>(`/admin/articles/${id}`, data)
    return res.data.data
  },

  deleteArticle: async (id: number) => {
    const res = await request.delete<ApiResponse<null>>(`/admin/articles/${id}`)
    return res.data
  },

  publishArticle: async (id: number) => {
    const res = await request.post<ApiResponse<Article>>(`/admin/articles/${id}/publish`)
    return res.data.data
  },

  // 标签管理
  getTags: async () => {
    const res = await request.get<ApiResponse<Tag[]>>('/admin/tags')
    return res.data.data
  },

  createTag: async (data: TagInput) => {
    const res = await request.post<ApiResponse<Tag>>('/admin/tags', data)
    return res.data.data
  },

  updateTag: async (id: number, data: TagInput) => {
    const res = await request.put<ApiResponse<Tag>>(`/admin/tags/${id}`, data)
    return res.data.data
  },

  deleteTag: async (id: number) => {
    const res = await request.delete<ApiResponse<null>>(`/admin/tags/${id}`)
    return res.data
  },

  // 站点设置
  getSiteConfig: async () => {
    const res = await request.get<ApiResponse<Record<string, string>>>('/admin/site/config')
    return res.data.data
  },

  updateSiteConfig: async (data: Record<string, string>) => {
    const res = await request.put<ApiResponse<null>>('/admin/site/config', data)
    return res.data
  },
}