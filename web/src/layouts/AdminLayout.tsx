// web/src/layouts/AdminLayout.tsx
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import AdminSidebar from '@/modules/admin/components/AdminSidebar'

export default function AdminLayout() {
  const location = useLocation()
  const token = localStorage.getItem('access_token')

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}