import { ArrowLeft, Eye, EyeSlash, EnvelopeSimple, WarningCircle } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthHero } from './AuthHero'
import {
  sendPasswordReset,
  signInWithPassword,
  signUpWithPassword,
  updatePassword,
  type AuthResult,
} from './authService'
import { useAuth } from './authStore'
import { authConfigured } from './supabase'

type Mode = 'signin' | 'signup' | 'forgot' | 'confirm' | 'resetSent'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

interface FieldErrors {
  email?: string
  password?: string
  confirm?: string
}

function PasswordField({
  label,
  value,
  onChange,
  error,
  autoComplete,
}: {
  label: string
  value: string
  onChange(v: string): void
  error?: string
  autoComplete: string
}) {
  const [shown, setShown] = useState(false)
  return (
    <label className={`field${error ? ' invalid' : ''}`}>
      {label}
      <span className="pw">
        <input
          type={shown ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="pw-toggle"
          aria-label={shown ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onClick={() => setShown(!shown)}
        >
          {shown ? <EyeSlash size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </span>
      {error && (
        <span className="err">
          <WarningCircle size={14} aria-hidden />
          {error}
        </span>
      )}
    </label>
  )
}

export function AuthPage() {
  const navigate = useNavigate()
  const { user, ready, recovery, clearRecovery } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [busy, setBusy] = useState(false)

  if (ready && user && !recovery) return <Navigate to="/" replace />

  const go = (next: Mode) => {
    setMode(next)
    setErrors({})
    setFormError(undefined)
    setPassword('')
    setConfirm('')
  }

  const validate = (needPassword: boolean, needConfirm: boolean): boolean => {
    const next: FieldErrors = {}
    if (!recovery && !EMAIL_RE.test(email.trim())) next.email = 'Hãy nhập một địa chỉ email hợp lệ.'
    if (needPassword && password.length < MIN_PASSWORD) next.password = `Mật khẩu cần ít nhất ${MIN_PASSWORD} ký tự.`
    if (needPassword && !needConfirm && password.length === 0) next.password = 'Hãy nhập mật khẩu.'
    if (needConfirm && confirm !== password) next.confirm = 'Mật khẩu nhập lại chưa khớp.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const run = async (task: () => Promise<AuthResult>, onOk: (r: Extract<AuthResult, { ok: true }>) => void) => {
    setBusy(true)
    setFormError(undefined)
    const res = await task()
    setBusy(false)
    if (res.ok) onOk(res)
    else setFormError(res.message)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const addr = email.trim()
    if (recovery) {
      if (!validate(true, true)) return
      void run(() => updatePassword(password), () => {
        clearRecovery()
        navigate('/', { replace: true })
      })
    } else if (mode === 'signin') {
      if (!validate(true, false)) return
      void run(() => signInWithPassword(addr, password), () => navigate('/', { replace: true }))
    } else if (mode === 'signup') {
      if (!validate(true, true)) return
      void run(() => signUpWithPassword(addr, password), (r) =>
        r.needsConfirmation ? go('confirm') : navigate('/', { replace: true }),
      )
    } else if (mode === 'forgot') {
      if (!validate(false, false)) return
      void run(() => sendPasswordReset(addr), () => go('resetSent'))
    }
  }

  const title = recovery
    ? 'Đặt mật khẩu mới'
    : { signin: 'Chào mừng trở lại', signup: 'Tạo tài khoản', forgot: 'Quên mật khẩu', confirm: 'Kiểm tra email của bạn', resetSent: 'Đã gửi hướng dẫn' }[mode]

  return (
    <div className="auth-wrap">
      <div className="auth-shell">
        <AuthHero />
        <div className="auth-panel">
          {(mode === 'confirm' || mode === 'resetSent') && !recovery ? (
            <div className="auth-form">
              <div className="empty" style={{ border: 0, padding: '12px 0' }}>
                <div className="ring">
                  <EnvelopeSimple size={34} aria-hidden />
                </div>
                <h1 className="t-title">{title}</h1>
                <p className="t-small" style={{ maxWidth: '36ch' }}>
                  {mode === 'confirm'
                    ? `Mình đã gửi thư xác nhận tới ${email.trim()}. Mở thư và bấm vào liên kết để hoàn tất đăng ký.`
                    : `Nếu ${email.trim()} có tài khoản, bạn sẽ nhận được thư hướng dẫn đặt lại mật khẩu trong ít phút.`}
                </p>
                <button className="btn" type="button" onClick={() => go('signin')}>
                  <ArrowLeft size={16} aria-hidden />
                  Về trang đăng nhập
                </button>
              </div>
            </div>
          ) : (
            <form className="auth-form" onSubmit={submit} noValidate>
              <div>
                <h1 className="t-title">{title}</h1>
                {!recovery && mode === 'forgot' && (
                  <p className="t-small" style={{ marginTop: 6 }}>
                    Nhập email đã đăng ký, mình sẽ gửi liên kết đặt lại mật khẩu.
                  </p>
                )}
              </div>

              {!recovery && (mode === 'signin' || mode === 'signup') && (
                <div className="tabs" role="tablist" aria-label="Chọn thao tác" style={{ display: 'flex' }}>
                  <button type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => go('signin')} style={{ flex: 1, justifyContent: 'center' }}>
                    Đăng nhập
                  </button>
                  <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => go('signup')} style={{ flex: 1, justifyContent: 'center' }}>
                    Đăng ký
                  </button>
                </div>
              )}

              {!authConfigured && (
                <div className="banner" role="alert">
                  <WarningCircle size={22} aria-hidden />
                  Chưa cấu hình Supabase nên chưa thể đăng nhập. Hãy điền khoá trong .env.local.
                </div>
              )}
              {formError && (
                <div className="banner" role="alert">
                  <WarningCircle size={22} aria-hidden />
                  {formError}
                </div>
              )}

              {!recovery && (
                <label className={`field${errors.email ? ' invalid' : ''}`}>
                  Email
                  <input
                    type="email"
                    value={email}
                    autoComplete="email"
                    inputMode="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <span className="err">
                      <WarningCircle size={14} aria-hidden />
                      {errors.email}
                    </span>
                  )}
                </label>
              )}

              {(recovery || mode === 'signin' || mode === 'signup') && (
                <PasswordField
                  label={recovery ? 'Mật khẩu mới' : 'Mật khẩu'}
                  value={password}
                  onChange={setPassword}
                  error={errors.password}
                  autoComplete={mode === 'signin' && !recovery ? 'current-password' : 'new-password'}
                />
              )}
              {(recovery || mode === 'signup') && (
                <PasswordField label="Nhập lại mật khẩu" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" />
              )}
              {mode === 'signup' && !recovery && <p className="t-small">Tối thiểu {MIN_PASSWORD} ký tự.</p>}

              <button className="btn accent block" type="submit" disabled={busy || !authConfigured}>
                {busy
                  ? 'Đang xử lý…'
                  : recovery
                    ? 'Lưu mật khẩu mới'
                    : mode === 'signin'
                      ? 'Đăng nhập'
                      : mode === 'signup'
                        ? 'Tạo tài khoản'
                        : 'Gửi liên kết'}
              </button>

              {!recovery && mode === 'signin' && (
                <button type="button" className="link-btn" onClick={() => go('forgot')}>
                  Quên mật khẩu?
                </button>
              )}
              {!recovery && mode === 'forgot' && (
                <button type="button" className="link-btn" onClick={() => go('signin')}>
                  Quay lại đăng nhập
                </button>
              )}
            </form>
          )}

          {!recovery && (
            <div className="auth-guest">
              <Link className="btn ghost block" to="/">
                Tiếp tục không cần tài khoản
              </Link>
              <p className="t-small">Việc của bạn vẫn lưu trên trình duyệt này. Đồng bộ lên tài khoản sẽ có ở bước tiếp theo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
