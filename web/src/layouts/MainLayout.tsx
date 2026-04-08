import { Outlet } from 'react-router-dom'
import Navbar from '@/shared/components/Navbar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} VibeBlog. Powered by React & Go.
        </div>
      </footer>
    </div>
  )
}