import { useEffect, useRef } from 'react'
import type { AnimationState } from '@/shared/types/assistant'

interface Live2DViewerProps {
  modelUrl: string
  animationState: AnimationState
  width?: number
  height?: number
}

// Cubism 4 Core SDK loader — self-hosted with CDN fallback
let cubismCoreLoaded = false
const CUBISM_CORE_URLS = [
  '/live2dcubismcore.min.js',
  'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
]

function loadCubismCore(): Promise<void> {
  if (cubismCoreLoaded || (window as any).Live2DCubismCore) {
    cubismCoreLoaded = true
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    let index = 0
    const tryLoad = () => {
      if (index >= CUBISM_CORE_URLS.length) {
        reject(new Error('All Cubism Core CDN sources failed'))
        return
      }
      const script = document.createElement('script')
      script.src = CUBISM_CORE_URLS[index]
      script.onload = () => { cubismCoreLoaded = true; resolve() }
      script.onerror = () => { index++; script.remove(); tryLoad() }
      document.head.appendChild(script)
    }
    tryLoad()
  })
}

export default function Live2DViewer({
  modelUrl,
  animationState,
  width = 280,
  height = 320,
}: Live2DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<any>(null)
  const modelRef = useRef<any>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!canvasRef.current || initializedRef.current) return
    initializedRef.current = true

    let destroyed = false

    const initLive2D = async () => {
      try {
        await loadCubismCore()

        const PIXI = await import('pixi.js')
        ;(window as any).PIXI = PIXI

        const { Live2DModel } = await import('pixi-live2d-display/cubism4')

        if (destroyed || !canvasRef.current) return

        const app = new PIXI.Application({
          view: canvasRef.current,
          width,
          height,
          backgroundAlpha: 0,
          autoStart: true,
        })
        appRef.current = app

        const model = await Live2DModel.from(modelUrl, { autoInteract: false })
        if (destroyed) return

        const scale = Math.min(width / model.width, height / model.height) * 0.8
        model.scale.set(scale)
        model.anchor.set(0.5, 0.5)
        model.x = width / 2
        model.y = height / 2

        app.stage.addChild(model)
        modelRef.current = model

        try { model.motion('Idle', 0) } catch { /* no idle motion */ }
      } catch (err) {
        console.warn('Live2D init failed:', err)
        initializedRef.current = false
      }
    }

    initLive2D()

    return () => {
      destroyed = true
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
      modelRef.current = null
      initializedRef.current = false
    }
  }, [modelUrl, width, height])

  useEffect(() => {
    const model = modelRef.current
    if (!model) return
    try {
      const group = animationState === 'talking' || animationState === 'listening'
        ? 'TapBody'
        : animationState === 'thinking'
          ? 'Flick'
          : 'Idle'
      model.motion(group, 0)
    } catch { /* motion group may not exist */ }
  }, [animationState])

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="pointer-events-none"
    />
  )
}
