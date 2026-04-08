// web/src/modules/blog/api/blogApi.ts
import request from '@/shared/utils/request'
import type { Article, Tag } from '@/shared/types/models'
import type { ApiResponse } from '@/shared/types/api'

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface ArticleListResponse {
  articles: Article[]
  pagination: Pagination
}

interface ArchiveData {
  [year: string]: { [month: string]: number }
}

interface SiteConfigResponse {
  about_content: string
  avatar: string
  social_links: string
}

export const blogApi = {
  // 获取文章列表
  getArticles: (params: { page?: number; limit?: number; tag?: string }) =>
    request.get<ApiResponse<ArticleListResponse>>('/blog/articles', { params }),

  // 获取文章详情
  getArticle: (id: number) =>
    request.get<ApiResponse<Article>>(`/blog/articles/${id}`),

  // 获取标签列表
  getTags: () =>
    request.get<ApiResponse<Tag[]>>('/blog/tags'),

  // 获取归档数据
  getArchive: () =>
    request.get<ApiResponse<ArchiveData>>('/blog/archive'),

  // 搜索文章
  search: (params: { q: string; limit?: number }) =>
    request.get<ApiResponse<Article[]>>('/blog/search', { params }),

  // 获取站点配置
  getSiteConfig: () =>
    request.get<ApiResponse<SiteConfigResponse>>('/site/config'),
}