import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

describe('App', () => {
  it('renders navigation and routes', () => {
    render(
      <MemoryRouter initialEntries={['/report']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Công việc' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Báo cáo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Báo cáo' })).toBeInTheDocument()
  })
})
