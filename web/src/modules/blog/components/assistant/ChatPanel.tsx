import { useRef, useEffect, useCallback } from 'react'
import ChatMessageComponent from './ChatMessage'
import ChatInput from './ChatInput'
import VoiceInput from './VoiceInput'
import { useChatStream } from './useChatStream'
import type { ChatMessage, AnimationState } from '@/shared/types/assistant'

interface ChatPanelProps {
  welcomeMessage?: string
  voiceLanguage?: string
  onAnimationStateChange: (state: AnimationState) => void
}

export default function ChatPanel({ welcomeMessage, voiceLanguage = 'zh-CN', onAnimationStateChange }: ChatPanelProps) {
  const { messages, isStreaming, streamingContent, sendMessage, clearMessages } = useChatStream()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamingContent])

  const handleSend = useCallback((content: string) => {
    onAnimationStateChange('thinking')
    sendMessage(content)
  }, [onAnimationStateChange, sendMessage])

  // 监听流式内容变化来更新动画状态
  useEffect(() => {
    if (isStreaming && streamingContent) {
      onAnimationStateChange('talking')
    } else if (!isStreaming) {
      onAnimationStateChange('idle')
    }
  }, [isStreaming, streamingContent, onAnimationStateChange])

  const handleVoiceResult = useCallback((text: string) => {
    if (text.trim()) {
      handleSend(text.trim())
    }
  }, [handleSend])

  // 显示的消息列表（包含欢迎语 + 真实消息 + 流式内容）
  const displayMessages: ChatMessage[] = []
  if (messages.length === 0 && welcomeMessage) {
    displayMessages.push({ role: 'assistant', content: welcomeMessage })
  }
  displayMessages.push(...messages)

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {displayMessages.map((msg, i) => (
          <ChatMessageComponent key={i} message={msg} />
        ))}
        {isStreaming && streamingContent && (
          <ChatMessageComponent message={{ role: 'assistant', content: streamingContent }} />
        )}
      </div>

      {/* 输入框 */}
      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
        voiceButton={
          <VoiceInput
            language={voiceLanguage}
            disabled={isStreaming}
            onResult={handleVoiceResult}
            onAnimationStateChange={onAnimationStateChange}
          />
        }
      />
    </div>
  )
}
