// web/src/modules/blog/components/TagBadge.tsx
import { Link } from 'react-router-dom'
import type { Tag } from '@/shared/types/models'

interface Props {
  tag: Tag
  showCount?: boolean
}

export default function TagBadge({ tag, showCount = false }: Props) {
  return (
    <Link
      to={`/blog?tag=${tag.slug}`}
      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 rounded-full text-xs font-medium transition-colors"
    >
      <span className="text-purple-400">#</span>
      {tag.name}
      {showCount && tag.article_count !== undefined && (
        <span className="text-purple-400/60 ml-0.5">({tag.article_count})</span>
      )}
    </Link>
  )
}