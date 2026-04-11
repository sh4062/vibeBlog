// web/src/modules/blog/components/Pagination.tsx
import { Link } from 'react-router-dom'

interface Props {
  current: number
  total: number
  baseUrl: string
}

export default function Pagination({ current, total, baseUrl }: Props) {
  if (total <= 1) return null

  // 生成页码数组，限制显示数量
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5 // 最多显示5个页码

    if (total <= showPages) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(total)
      } else if (current >= total - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = total - 3; i <= total; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(total)
      }
    }

    return pages
  }

  return (
    <nav className="flex justify-center items-center gap-1">
      {/* 上一页 */}
      {current > 1 ? (
        <Link
          to={`${baseUrl}?page=${current - 1}`}
          className="px-3 py-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      ) : (
        <span className="px-3 py-2 text-gray-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      )}

      {/* 页码 */}
      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
        ) : (
          <Link
            key={p}
            to={`${baseUrl}?page=${p}`}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
              p === current
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </Link>
        )
      )}

      {/* 下一页 */}
      {current < total ? (
        <Link
          to={`${baseUrl}?page=${current + 1}`}
          className="px-3 py-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="px-3 py-2 text-gray-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  )
}