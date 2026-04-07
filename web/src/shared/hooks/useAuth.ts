import { useAuthStore } from '@/modules/auth/stores/authStore'
import { authApi } from '@/modules/auth/api/authApi'

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth, setTokens } = useAuthStore()

  const login = async (username: string, password: string) => {
    const result = await authApi.login({ username, password })
    setAuth(result.user, result.access_token, result.refresh_token)
    return result
  }

  const logout = async () => {
    await authApi.logout()
    clearAuth()
  }

  const refresh = async () => {
    const refreshToken = useAuthStore.getState().refreshToken
    if (!refreshToken) throw new Error('No refresh token')
    const result = await authApi.refresh(refreshToken)
    setTokens(result.access_token, result.refresh_token)
    return result
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    refresh,
  }
}