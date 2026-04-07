import request from '@/shared/utils/request'
import type { ApiResponse } from '@/shared/types/api'
import type { User } from '@/shared/types/models'

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

interface RefreshResponse {
  access_token: string
  refresh_token: string
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await request.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return res.data.data
  },

  refresh: async (refreshToken: string) => {
    const res = await request.post<ApiResponse<RefreshResponse>>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return res.data.data
  },

  logout: async () => {
    const res = await request.post<ApiResponse<null>>('/auth/logout')
    return res.data
  },
}