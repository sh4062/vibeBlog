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
  getArticles: async (params: { page?: number; limit?: number; tag?: string }) => {
    const res = await request.get<ApiResponse<ArticleListResponse>>('/blog/articles', { params })
    return res.data.data
  },

  // 获取文章详情
  getArticle: async (id: number) => {
    const res = await request.get<ApiResponse<Article>>(`/blog/articles/${id}`)
    return res.data.data
  },

  // 获取标签列表
  getTags: async () => {
    const res = await request.get<ApiResponse<Tag[]>>('/blog/tags')
    return res.data.data
  },

  // 获取归档数据
  getArchive: async () => {
    const res = await request.get<ApiResponse<ArchiveData>>('/blog/archive')
    return res.data.data
  },

  // 获取指定年月的文章
  getArchiveByMonth: async (year: number, month: number) => {
    const res = await request.get<ApiResponse<Article[]>>(`/blog/archive/${year}/${month}`)
    return res.data.data
  },

  // 搜索文章
  search: async (params: { q: string; limit?: number }) => {
    const res = await request.get<ApiResponse<Article[]>>('/blog/search', { params })
    return res.data.data
  },

  // 获取站点配置
  getSiteConfig: async () => {
    const res = await request.get<ApiResponse<SiteConfigResponse>>('/site/config')
    return res.data.data
  },
}