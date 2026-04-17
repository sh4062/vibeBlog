export interface AssistantConfig {
  id?: number
  name: string
  system_prompt: string
  live2d_model_path: string
  fallback_avatar: string
  voice_language: string
  voice_rate: number
  enabled: boolean
  position_x: number
  position_y: number
  widget_size: string
  openai_model: string
  openai_base_url: string
  openai_key: string
  temperature: number
  max_tokens: number
  welcome_message: string
}

export interface AssistantConfigPublic {
  name: string
  fallback_avatar: string
  live2d_model_path: string
  enabled: boolean
  position_x: number
  position_y: number
  widget_size: string
  welcome_message: string
  voice_language: string
  voice_rate: number
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type AnimationState = 'idle' | 'talking' | 'thinking' | 'listening'
