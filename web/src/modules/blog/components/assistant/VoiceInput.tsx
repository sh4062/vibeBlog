import { useVoiceRecognition } from './useVoiceRecognition'

interface VoiceInputProps {
  language: string
  disabled: boolean
  onResult: (text: string) => void
  onAnimationStateChange: (state: import('@/shared/types/assistant').AnimationState) => void
}

export default function VoiceInput({ language, disabled, onResult, onAnimationStateChange }: VoiceInputProps) {
  const { isListening, isSupported, startListening, stopListening } = useVoiceRecognition({
    language,
    onAnimationStateChange,
    onResult,
  })

  if (!isSupported) return null

  const handleClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
        isListening
          ? 'bg-red-500/20 text-red-400 animate-pulse'
          : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
      }`}
      title={isListening ? '停止录音' : '语音输入'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    </button>
  )
}
