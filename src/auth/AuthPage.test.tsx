import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from './authStore'
import { AuthPage } from './AuthPage'
import * as service from './authService'

vi.mock('./supabase', () => ({ supabase: null, authConfigured: true }))
vi.mock('./authService')

const signIn = vi.mocked(service.signInWithPassword)
const signUp = vi.mocked(service.signUpWithPassword)
const reset = vi.mocked(service.sendPasswordReset)
const update = vi.mocked(service.updatePassword)

function renderAuth() {
  render(
    <MemoryRouter initialEntries={['/auth']}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<p>Trang chủ</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

const fill = async (label: string | RegExp, value: string) =>
  userEvent.type(screen.getByLabelText(label), value)

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.setState({ user: null, ready: true, recovery: false })
  })

  it('shows the sign-in form by default, with a guest option', () => {
    renderAuth()
    expect(screen.getByRole('heading', { name: 'Chào mừng trở lại' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Đăng nhập' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('link', { name: 'Tiếp tục không cần tài khoản' })).toHaveAttribute('href', '/')
  })

  it('validates email and empty password without calling the server', async () => {
    renderAuth()
    await fill('Email', 'khong-hop-le')
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập', exact: true } as never))
    expect(screen.getByText('Hãy nhập một địa chỉ email hợp lệ.')).toBeInTheDocument()
    expect(screen.getByText('Hãy nhập mật khẩu.')).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('signs in and goes to the home page', async () => {
    signIn.mockResolvedValue({ ok: true })
    renderAuth()
    await fill('Email', ' an@example.com ')
    await fill('Mật khẩu', 'matkhau123')
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập', exact: true } as never))
    expect(signIn).toHaveBeenCalledWith('an@example.com', 'matkhau123')
    expect(await screen.findByText('Trang chủ')).toBeInTheDocument()
  })

  it('shows a translated server error and stays on the page', async () => {
    signIn.mockResolvedValue({ ok: false, message: 'Email hoặc mật khẩu chưa đúng.' })
    renderAuth()
    await fill('Email', 'an@example.com')
    await fill('Mật khẩu', 'sai-mat-khau')
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập', exact: true } as never))
    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu chưa đúng.')
    expect(screen.queryByText('Trang chủ')).not.toBeInTheDocument()
  })

  it('sign-up needs a password of 8+ characters that matches the confirmation', async () => {
    renderAuth()
    await userEvent.click(screen.getByRole('tab', { name: 'Đăng ký' }))
    await fill('Email', 'an@example.com')
    await fill('Mật khẩu', 'ngan')
    await fill('Nhập lại mật khẩu', 'khac')
    await userEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))
    expect(screen.getByText('Mật khẩu cần ít nhất 8 ký tự.')).toBeInTheDocument()
    expect(screen.getByText('Mật khẩu nhập lại chưa khớp.')).toBeInTheDocument()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('sign-up goes home when no email confirmation is needed', async () => {
    signUp.mockResolvedValue({ ok: true, needsConfirmation: false })
    renderAuth()
    await userEvent.click(screen.getByRole('tab', { name: 'Đăng ký' }))
    await fill('Email', 'an@example.com')
    await fill('Mật khẩu', 'matkhau123')
    await fill('Nhập lại mật khẩu', 'matkhau123')
    await userEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))
    expect(signUp).toHaveBeenCalledWith('an@example.com', 'matkhau123')
    expect(await screen.findByText('Trang chủ')).toBeInTheDocument()
  })

  it('sign-up asks the user to check their email when confirmation is on', async () => {
    signUp.mockResolvedValue({ ok: true, needsConfirmation: true })
    renderAuth()
    await userEvent.click(screen.getByRole('tab', { name: 'Đăng ký' }))
    await fill('Email', 'an@example.com')
    await fill('Mật khẩu', 'matkhau123')
    await fill('Nhập lại mật khẩu', 'matkhau123')
    await userEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))
    expect(await screen.findByRole('heading', { name: 'Kiểm tra email của bạn' })).toBeInTheDocument()
    expect(screen.getByText(/an@example.com/)).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    renderAuth()
    const input = screen.getByLabelText('Mật khẩu') as HTMLInputElement
    expect(input.type).toBe('password')
    await userEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }))
    expect(input.type).toBe('text')
    expect(screen.getByRole('button', { name: 'Ẩn mật khẩu' })).toBeInTheDocument()
  })

  it('forgot password sends a reset link and confirms', async () => {
    reset.mockResolvedValue({ ok: true })
    renderAuth()
    await userEvent.click(screen.getByRole('button', { name: 'Quên mật khẩu?' }))
    expect(screen.queryByLabelText('Mật khẩu')).not.toBeInTheDocument()
    await fill('Email', 'an@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Gửi liên kết' }))
    expect(reset).toHaveBeenCalledWith('an@example.com')
    expect(await screen.findByRole('heading', { name: 'Đã gửi hướng dẫn' })).toBeInTheDocument()
  })

  it('recovery mode asks for a new password and then goes home', async () => {
    update.mockResolvedValue({ ok: true })
    useAuth.setState({ recovery: true })
    renderAuth()
    expect(screen.getByRole('heading', { name: 'Đặt mật khẩu mới' })).toBeInTheDocument()
    await fill('Mật khẩu mới', 'matkhaumoi1')
    await fill('Nhập lại mật khẩu', 'matkhaumoi1')
    await userEvent.click(screen.getByRole('button', { name: 'Lưu mật khẩu mới' }))
    await waitFor(() => expect(update).toHaveBeenCalledWith('matkhaumoi1'))
    expect(await screen.findByText('Trang chủ')).toBeInTheDocument()
    expect(useAuth.getState().recovery).toBe(false)
  })

  it('redirects a signed-in user away from the auth page', () => {
    useAuth.setState({ user: { id: 'u1', email: 'an@example.com' } as never })
    renderAuth()
    expect(screen.getByText('Trang chủ')).toBeInTheDocument()
  })
})
