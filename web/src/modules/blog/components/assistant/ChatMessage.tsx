import type { ChatMessage as ChatMessageType } from '@/shared/types/assistant'

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-sm'
            : 'bg-white/10 text-white/90 rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
