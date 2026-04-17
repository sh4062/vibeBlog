import { useState, useCallback, useRef } from 'react'
import { assistantApi } from '@/modules/blog/api/assistantApi'
import type { ChatMessage } from '@/shared/types/assistant'

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem('assistant_messages')
    return saved ? JSON.parse(saved) : []
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const abortRef = useRef(false)

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    sessionStorage.setItem('assistant_messages', JSON.stringify(newMessages))

    setIsStreaming(true)
    setStreamingContent('')
    abortRef.current = false

    let accumulated = ''

    await assistantApi.streamChat(
      newMessages,
      (chunk) => {
        if (abortRef.current) return
        accumulated += chunk
        setStreamingContent(accumulated)
      },
      () => {
        const assistantMessage: ChatMessage = { role: 'assistant', content: accumulated }
        const finalMessages = [...newMessages, assistantMessage]
        setMessages(finalMessages)
        sessionStorage.setItem('assistant_messages', JSON.stringify(finalMessages))
        setStreamingContent('')
        setIsStreaming(false)
      },
      (error) => {
        const errorMessage: ChatMessage = { role: 'assistant', content: `[错误] ${error}` }
        const finalMessages = [...newMessages, errorMessage]
        setMessages(finalMessages)
        sessionStorage.setItem('assistant_messages', JSON.stringify(finalMessages))
        setStreamingContent('')
        setIsStreaming(false)
      },
    )
  }, [messages])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStreamingContent('')
    sessionStorage.removeItem('assistant_messages')
  }, [setMessages])

  return {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    clearMessages,
  }
}
