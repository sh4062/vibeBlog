import { useState, useRef, useCallback, useEffect } from 'react'
import type { AnimationState } from '@/shared/types/assistant'

interface UseVoiceRecognitionProps {
  language: string
  onAnimationStateChange: (state: AnimationState) => void
  onResult: (text: string) => void
}

export function useVoiceRecognition({ language, onAnimationStateChange, onResult }: UseVoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
      onAnimationStateChange('listening')
    }

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1]
      if (last.isFinal) {
        onResult(last[0].transcript)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      onAnimationStateChange('idle')
    }

    recognition.onend = () => {
      setIsListening(false)
      onAnimationStateChange('idle')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [language, onAnimationStateChange, onResult])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  }
}
