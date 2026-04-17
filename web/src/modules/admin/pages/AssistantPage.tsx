import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { adminAssistantApi } from '@/modules/admin/api/adminAssistantApi'
import type { AssistantConfig } from '@/shared/types/assistant'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const defaultConfig: AssistantConfig = {
  name: 'Aria',
  system_prompt: '你是一个友好的博客助手，帮助访客了解博客内容。',
  live2d_model_path: '',
  fallback_avatar: '',
  voice_language: 'zh-CN',
  voice_rate: 1.0,
  enabled: false,
  position_x: 20,
  position_y: 80,
  widget_size: 'medium',
  openai_model: 'gpt-4o-mini',
  openai_base_url: 'https://api.openai.com/v1',
  openai_key: '',
  temperature: 0.7,
  max_tokens: 500,
  welcome_message: '你好！有什么可以帮你的吗？',
}

export default function AssistantPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<AssistantConfig>(defaultConfig)

  const { data: config, isLoading } = useQuery({
    queryKey: ['adminAssistantConfig'],
    queryFn: () => adminAssistantApi.getConfig(),
  })

  useEffect(() => {
    if (config) {
      setForm({ ...defaultConfig, ...config })
    }
  }, [config])

  const updateMutation = useMutation({
    mutationFn: (data: AssistantConfig) => adminAssistantApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAssistantConfig'] })
      queryClient.invalidateQueries({ queryKey: ['assistantConfig'] })
      alert('助手设置已保存')
    },
  })

  const handleSave = () => {
    updateMutation.mutate(form)
  }

  const updateField = <K extends keyof AssistantConfig>(key: K, value: AssistantConfig[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return <div className="text-white/60">加载中...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">AI 助手设置</h1>

      <div className="space-y-6">
        {/* 基础设置 */}
        <Section title="基础设置">
          <Toggle label="启用 AI 助手" checked={form.enabled} onChange={(v) => updateField('enabled', v)} />
          <Field label="助手名称">
            <Input value={form.name} onChange={(v) => updateField('name', v)} placeholder="Aria" />
          </Field>
          <Field label="欢迎语">
            <Input value={form.welcome_message} onChange={(v) => updateField('welcome_message', v)} placeholder="你好！有什么可以帮你的吗？" />
          </Field>
        </Section>

        {/* 人设与性格 */}
        <Section title="人设与性格">
          <Field label="系统提示词（System Prompt）">
            <textarea
              value={form.system_prompt}
              onChange={(e) => updateField('system_prompt', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
              rows={4}
              placeholder="你是一个友好的博客助手..."
            />
          </Field>
        </Section>

        {/* 外观设置 */}
        <Section title="外观设置">
          <Field label="备用头像 URL（未上传 Live2D 模型时使用）">
            <Input value={form.fallback_avatar} onChange={(v) => updateField('fallback_avatar', v)} placeholder="https://example.com/avatar.png" />
          </Field>
          {form.fallback_avatar && (
            <img src={form.fallback_avatar} alt="Avatar" className="w-16 h-16 rounded-full mt-2" />
          )}
          <Field label="Live2D 模型路径">
            <Input value={form.live2d_model_path} onChange={(v) => updateField('live2d_model_path', v)} placeholder="/live2d/model/" disabled />
          </Field>
          <ModelUpload
            currentPath={form.live2d_model_path}
            onUploaded={(path) => updateField('live2d_model_path', path)}
          />
          <Field label="小组件大小">
            <select
              value={form.widget_size}
              onChange={(e) => updateField('widget_size', e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="位置 X (%)">
              <input
                type="number"
                value={form.position_x}
                onChange={(e) => updateField('position_x', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </Field>
            <Field label="位置 Y (%)">
              <input
                type="number"
                value={form.position_y}
                onChange={(e) => updateField('position_y', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </Field>
          </div>
        </Section>

        {/* 语音设置 */}
        <Section title="语音设置">
          <Field label="语音识别语言">
            <select
              value={form.voice_language}
              onChange={(e) => updateField('voice_language', e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="zh-CN">中文（简体）</option>
              <option value="zh-TW">中文（繁体）</option>
              <option value="en-US">英语（美式）</option>
              <option value="ja-JP">日语</option>
              <option value="ko-KR">韩语</option>
            </select>
          </Field>
        </Section>

        {/* AI 模型设置 */}
        <Section title="AI 模型设置">
          <Field label="API Base URL">
            <Input
              value={form.openai_base_url}
              onChange={(v) => updateField('openai_base_url', v)}
              placeholder="https://api.openai.com/v1"
            />
            <p className="text-white/30 text-xs mt-1">支持 OpenAI 兼容接口，如 DeepSeek、Moonshot、Ollama 等</p>
          </Field>
          <Field label="API Key">
            <input
              type="password"
              value={form.openai_key}
              onChange={(e) => updateField('openai_key', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="sk-..."
            />
          </Field>
          <Field label="模型名称">
            <Input
              value={form.openai_model}
              onChange={(v) => updateField('openai_model', v)}
              placeholder="gpt-4o-mini"
            />
            <p className="text-white/30 text-xs mt-1">可直接输入任意模型名称，如 gpt-4o、deepseek-chat、moonshot-v1-8k 等</p>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`温度 (Temperature): ${form.temperature}`}>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={form.temperature}
                onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
            </Field>
            <Field label="最大 Token 数">
              <input
                type="number"
                value={form.max_tokens}
                onChange={(e) => updateField('max_tokens', parseInt(e.target.value) || 500)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min={100}
                max={4000}
              />
            </Field>
          </div>
          {/* 测试连接 */}
          <TestButton form={form} />
        </Section>

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {updateMutation.isPending ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/60 text-sm mb-2">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, disabled }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
      placeholder={placeholder}
    />
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/80">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-purple-600' : 'bg-white/20'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

function ModelUpload({
  currentPath,
  onUploaded,
}: {
  currentPath: string
  onUploaded: (path: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const fileArray = Array.from(files)
      // 使用 webkitRelativePath 保留目录结构
      const result = await adminAssistantApi.uploadModel(fileArray)
      onUploaded(result.path)
      alert(`上传成功！共 ${result.files} 个文件`)
    } catch {
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {currentPath && (
        <p className="text-white/40 text-xs mb-2">
          当前模型: {API_URL}/uploads/{currentPath}
        </p>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-white/20'
        }`}
      >
        <p className="text-white/40 text-sm mb-2">
          选择 Live2D 模型文件夹（包含 .model3.json、.moc3、纹理等）
        </p>
        <div className="flex gap-2 justify-center">
          <label className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg cursor-pointer transition-colors">
            {uploading ? '上传中...' : '选择文件夹'}
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
              {...{ webkitdirectory: '', directory: '' } as any}
            />
          </label>
          <label className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg cursor-pointer transition-colors">
            {uploading ? '上传中...' : '选择文件'}
            <input
              type="file"
              multiple
              accept=".moc3,.json,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

function TestButton({ form }: { form: AssistantConfig }) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; reply?: string } | null>(null)

  const handleTest = async () => {
    setTesting(true)
    setResult(null)
    try {
      const res = await adminAssistantApi.testConnection(form)
      setResult(res)
    } catch {
      setResult({ success: false, message: '请求失败，请检查网络' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="border-t border-white/10 pt-4">
      <button
        onClick={handleTest}
        disabled={testing || !form.openai_key}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {testing ? '测试中...' : '测试连接'}
      </button>
      {result && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm ${
            result.success
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          <div className="font-medium">{result.success ? '连接成功' : '连接失败'}</div>
          <div className="mt-1 opacity-80">{result.message}</div>
          {result.success && result.reply && (
            <div className="mt-2 px-2 py-1 bg-white/5 rounded text-white/60 text-xs">
              模型回复: {result.reply}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
