// web/src/modules/blog/components/Pagination.tsx
import { Link } from 'react-router-dom'

interface Props {
  current: number
  total: number
  baseUrl: string
}

export default function Pagination({ current, total, baseUrl }: Props) {
  if (total <= 1) return null

  const pages = []
  for (let i = 1; i <= total; i++) {
    pages.push(i)
  }

  return (
    <nav className="flex justify-center space-x-1 mt-8">
      {current > 1 && (
        <Link
          to={`${baseUrl}?page=${current - 1}`}
          className="px-3 py-2 rounded border text-gray-600 hover:bg-gray-50"
        >
          上一页
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          to={`${baseUrl}?page=${p}`}
          className={`px-3 py-2 rounded ${
            p === current
              ? 'bg-blue-600 text-white'
              : 'border text-gray-600 hover:bg-gray-50'
          }`}
        >
          {p}
        </Link>
      ))}

      {current < total && (
        <Link
          to={`${baseUrl}?page=${current + 1}`}
          className="px-3 py-2 rounded border text-gray-600 hover:bg-gray-50"
        >
          下一页
        </Link>
      )}
    </nav>
  )
}