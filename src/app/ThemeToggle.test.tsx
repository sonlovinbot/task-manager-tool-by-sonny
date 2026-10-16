import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.clear()
  })

  it('switches between dark and light and remembers the choice', async () => {
    document.documentElement.setAttribute('data-theme', 'light')
    render(<ThemeToggle />)
    await userEvent.click(screen.getByRole('button', { name: 'Đổi giao diện sáng tối' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('tm-theme')).toBe('dark')
    await userEvent.click(screen.getByRole('button', { name: 'Đổi giao diện sáng tối' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
