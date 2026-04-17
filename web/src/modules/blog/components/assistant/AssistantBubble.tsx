interface AssistantBubbleProps {
  avatar?: string
  name?: string
  onClick: () => void
}

export default function AssistantBubble({ avatar, name, onClick }: AssistantBubbleProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-110"
      title={name || 'AI 助手'}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name || 'AI 助手'}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-white text-2xl">
          🤖
        </div>
      )}
      {/* 呼吸动画光环 */}
      <span className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping" />
    </button>
  )
}
