// web/src/modules/admin/components/AdminSidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/articles', label: '文章管理', icon: '📝' },
  { path: '/admin/tags', label: '标签管理', icon: '🏷️' },
  { path: '/admin/assistant', label: 'AI 助手', icon: '🤖' },
  { path: '/admin/settings', label: '站点设置', icon: '⚙️' },
]

export default function AdminSidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/80 backdrop-blur border-r border-white/10">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">VibeBlog Admin</h1>
      </div>

      <nav className="mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors ${
                isActive ? 'bg-white/10 text-white border-r-2 border-purple-500' : ''
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full text-left text-white/60 hover:text-white transition-colors"
        >
          退出登录
        </button>
      </div>
    </aside>
  )
}