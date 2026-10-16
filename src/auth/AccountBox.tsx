import { SignOut, UserCircle } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { signOut } from './authService'
import { useAuth } from './authStore'
import { authConfigured } from './supabase'

export function AccountBox() {
  const user = useAuth((s) => s.user)
  if (!authConfigured) return null

  if (!user) {
    return (
      <div className="account">
        <div className="who">
          <span className="avatar" aria-hidden>
            <UserCircle size={22} />
          </span>
          <span>Chế độ cục bộ</span>
        </div>
        <Link className="btn sm" to="/auth">
          Đăng nhập hoặc đăng ký
        </Link>
      </div>
    )
  }

  const email = user.email ?? 'Tài khoản'
  return (
    <div className="account">
      <div className="who">
        <span className="avatar" aria-hidden>
          {email.charAt(0).toUpperCase()}
        </span>
        <span title={email}>{email}</span>
      </div>
      <button className="btn sm" type="button" onClick={() => void signOut()}>
        <SignOut size={16} aria-hidden />
        Đăng xuất
      </button>
    </div>
  )
}
