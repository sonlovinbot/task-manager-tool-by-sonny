import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './authStore'
import { authConfigured } from './supabase'

/** Everything except the sign-in page needs an account. Without Supabase keys the app runs local-only. */
export function RequireAuth() {
  const { user, ready } = useAuth()
  if (!authConfigured) return <Outlet />
  if (!ready) {
    return (
      <div className="auth-wrap" aria-busy="true" role="status" aria-label="Đang kiểm tra đăng nhập">
        <div style={{ width: 'min(420px, 100%)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/auth" replace />
  return <Outlet />
}
