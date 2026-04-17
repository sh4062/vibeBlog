import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
  voiceButton?: React.ReactNode
  onVoiceText?: (text: string) => void
}

export default function ChatInput({ onSend, disabled, voiceButton }: ChatInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  return (
    <div className="flex items-center gap-2 p-3 border-t border-white/10">
      {voiceButton}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
        placeholder="输入消息..."
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        发送
      </button>
    </div>
  )
}
