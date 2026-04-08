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
      to={`/blog/tag/${tag.slug}`}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
    >
      {tag.name}
      {showCount && tag.article_count !== undefined && (
        <span className="ml-1 text-blue-600">({tag.article_count})</span>
      )}
    </Link>
  )
}