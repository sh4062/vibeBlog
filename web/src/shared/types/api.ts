export interface ApiResponse<T> {
  data: T
  message?: string
  error?: {
    code: string
    message: string
  }
}

export interface PagedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
}