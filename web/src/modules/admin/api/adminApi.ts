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
  getStats: () => request.get<ApiResponse<Stats>>('/admin/stats'),

  // 文章管理
  getArticles: (params: { page?: number; limit?: number; status?: string; keyword?: string }) =>
    request.get<ApiResponse<PagedResponse<Article>>>('/admin/articles', { params }),

  getArticle: (id: number) =>
    request.get<ApiResponse<Article>>(`/admin/articles/${id}`),

  createArticle: (data: ArticleInput) =>
    request.post<ApiResponse<Article>>('/admin/articles', data),

  updateArticle: (id: number, data: ArticleInput) =>
    request.put<ApiResponse<Article>>(`/admin/articles/${id}`, data),

  deleteArticle: (id: number) =>
    request.delete<ApiResponse<null>>(`/admin/articles/${id}`),

  publishArticle: (id: number) =>
    request.post<ApiResponse<Article>>(`/admin/articles/${id}/publish`),

  // 标签管理
  getTags: () => request.get<ApiResponse<Tag[]>>('/admin/tags'),

  createTag: (data: TagInput) =>
    request.post<ApiResponse<Tag>>('/admin/tags', data),

  updateTag: (id: number, data: TagInput) =>
    request.put<ApiResponse<Tag>>(`/admin/tags/${id}`, data),

  deleteTag: (id: number) =>
    request.delete<ApiResponse<null>>(`/admin/tags/${id}`),

  // 站点设置
  getSiteConfig: () => request.get<ApiResponse<Record<string, string>>>('/admin/site/config'),

  updateSiteConfig: (data: Record<string, string>) =>
    request.put<ApiResponse<null>>('/admin/site/config', data),
}