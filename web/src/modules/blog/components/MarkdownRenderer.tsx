// web/src/modules/blog/components/MarkdownRenderer.tsx
import { Viewer } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github.css'

interface Props {
  content: string
}

const plugins = [gfm(), highlight()]

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-slate max-w-none">
      <Viewer value={content} plugins={plugins} />
    </div>
  )
}