import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { assistantApi } from '@/modules/blog/api/assistantApi'
import AssistantBubble from './AssistantBubble'
import ChatPanel from './ChatPanel'
import Live2DViewer from './Live2DViewer'
import type { AnimationState } from '@/shared/types/assistant'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [animationState, setAnimationState] = useState<AnimationState>('idle')

  const { data: config } = useQuery({
    queryKey: ['assistantConfig'],
    queryFn: () => assistantApi.getPublicConfig(),
    staleTime: 5 * 60 * 1000,
  })

  const handleAnimationStateChange = useCallback((state: AnimationState) => {
    setAnimationState(state)
  }, [])

  if (!config || !config.enabled) return null

  const hasLive2D = !!config.live2d_model_path

  return (
    <>
      {!isOpen && (
        <div className="fixed z-50 right-5 bottom-5">
          <AssistantBubble
            avatar={config.fallback_avatar}
            name={config.name}
            onClick={() => setIsOpen(true)}
          />
        </div>
      )}

      {isOpen && (
        <div
          className="fixed z-50 right-5 bottom-5 flex overflow-hidden rounded-2xl shadow-2xl shadow-black/40 border border-white/20"
          style={{
            width: hasLive2D ? '560px' : '360px',
            height: '500px',
            background: 'linear-gradient(135deg, rgba(15, 10, 40, 0.95), rgba(30, 20, 60, 0.95))',
            backdropFilter: 'blur(20px)',
          }}
        >
          {hasLive2D && (
            <div className="w-[220px] flex-shrink-0 flex items-center justify-center relative">
              <Live2DViewer
                modelUrl={`${API_URL}/uploads/${config.live2d_model_path}`}
                animationState={animationState}
                width={220}
                height={460}
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs whitespace-nowrap">
                {animationState === 'idle' && '在线'}
                {animationState === 'thinking' && '思考中...'}
                {animationState === 'talking' && '回复中...'}
                {animationState === 'listening' && '聆听中...'}
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col min-w-0 border-l border-white/10">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <span className="text-white text-sm font-medium">{config.name}</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white/80 transition-colors text-sm"
              >
                ✕
              </button>
            </div>
            <ChatPanel
              welcomeMessage={config.welcome_message}
              voiceLanguage={config.voice_language}
              onAnimationStateChange={handleAnimationStateChange}
            />
          </div>
        </div>
      )}
    </>
  )
}
