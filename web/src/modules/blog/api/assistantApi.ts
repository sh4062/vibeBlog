import request from '@/shared/utils/request'
import type { ApiResponse } from '@/shared/types/api'
import type { AssistantConfigPublic, ChatMessage } from '@/shared/types/assistant'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const assistantApi = {
  getPublicConfig: async () => {
    const res = await request.get<ApiResponse<AssistantConfigPublic>>('/blog/assistant')
    return res.data.data
  },

  streamChat: async (
    messages: ChatMessage[],
    onChunk: (content: string) => void,
    onDone: () => void,
    onError: (error: string) => void,
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/blog/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: '请求失败' }))
        onError(err.error || 'AI 服务暂时不可用')
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            onDone()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch {
            // 跳过无法解析的行
          }
        }
      }
      onDone()
    } catch {
      onError('网络连接失败，请稍后重试')
    }
  },
}
