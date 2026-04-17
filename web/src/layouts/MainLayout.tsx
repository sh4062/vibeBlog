import { Outlet } from 'react-router-dom'
import Navbar from '@/shared/components/Navbar'
import AssistantWidget from '@/modules/blog/components/assistant/AssistantWidget'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">V</span>
              </div>
              <span className="font-semibold text-gray-700">VibeBlog</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors">
                GitHub
              </a>
              <a href="mailto:hello@example.com" className="hover:text-gray-700 transition-colors">
                Email
              </a>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
      <AssistantWidget />
    </div>
  )
}