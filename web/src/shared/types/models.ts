export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  role: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  description: string
  article_count?: number
}

export type ArticleStatus = 'draft' | 'published' | 'scheduled'

export interface Article {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  cover_image: string
  status: ArticleStatus
  published_at: string | null
  scheduled_at: string | null
  view_count: number
  author_id: number
  tags: Tag[]
  author?: User
  created_at: string
  updated_at: string
}

export interface SiteConfig {
  about_content: string
  avatar: string
  social_links: Record<string, string>
}