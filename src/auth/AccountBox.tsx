import { SignOut } from '@phosphor-icons/react'
import { SyncStatusLine } from '../sync/SyncStatusLine'
import { signOut } from './authService'
import { useAuth } from './authStore'
import { authConfigured } from './supabase'

export function AccountBox() {
  const user = useAuth((s) => s.user)
  if (!authConfigured) return null

  if (!user) return null

  const email = user.email ?? 'Tài khoản'
  return (
    <div className="account">
      <div className="who">
        <span className="avatar" aria-hidden>
          {email.charAt(0).toUpperCase()}
        </span>
        <span title={email}>{email}</span>
      </div>
      <SyncStatusLine />
      <button className="btn sm" type="button" onClick={() => void signOut()}>
        <SignOut size={16} aria-hidden />
        Đăng xuất
      </button>
    </div>
  )
}
