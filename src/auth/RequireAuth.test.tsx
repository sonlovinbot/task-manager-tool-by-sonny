import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from './authStore'
import { RequireAuth } from './RequireAuth'

vi.mock('./supabase', () => ({ supabase: null, authConfigured: true }))

function renderGate() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/auth" element={<p>Màn đăng nhập</p>} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<p>Nội dung ứng dụng</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  it('shows a loading state, not the app and not a redirect, until the stored session is read', () => {
    useAuth.setState({ user: null, ready: false })
    renderGate()
    expect(screen.getByRole('status', { name: 'Đang kiểm tra đăng nhập' })).toBeInTheDocument()
    expect(screen.queryByText('Nội dung ứng dụng')).not.toBeInTheDocument()
    expect(screen.queryByText('Màn đăng nhập')).not.toBeInTheDocument()
  })

  it('sends signed-out visitors to the sign-in page and never renders the app', () => {
    useAuth.setState({ user: null, ready: true })
    renderGate()
    expect(screen.getByText('Màn đăng nhập')).toBeInTheDocument()
    expect(screen.queryByText('Nội dung ứng dụng')).not.toBeInTheDocument()
  })

  it('lets a signed-in user in', () => {
    useAuth.setState({ user: { id: 'u1', email: 'an@example.com' } as never, ready: true })
    renderGate()
    expect(screen.getByText('Nội dung ứng dụng')).toBeInTheDocument()
  })
})
