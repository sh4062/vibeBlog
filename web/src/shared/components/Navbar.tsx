import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              VibeBlog
            </Link>
            <div className="hidden sm:flex space-x-4">
              <Link to="/blog" className="text-gray-600 hover:text-gray-900">
                博客
              </Link>
              <Link to="/blog/tag" className="text-gray-600 hover:text-gray-900">
                标签
              </Link>
              <Link to="/blog/archive" className="text-gray-600 hover:text-gray-900">
                归档
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">
                关于
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              登录
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}