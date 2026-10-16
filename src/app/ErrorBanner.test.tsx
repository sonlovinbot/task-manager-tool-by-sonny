import { render, screen } from '@testing-library/react'
import { ErrorBanner } from './ErrorBanner'
import { createTask } from '../domain/task'
import { useTaskStore } from '../features/tasks/store'

describe('ErrorBanner', () => {
  afterEach(() => useTaskStore.setState({ error: undefined, tasks: [] }))

  it('shows banner text when store has error', () => {
    useTaskStore.setState({ error: 'Lỗi lưu trữ', tasks: [createTask({ title: 'a' })] })
    render(<ErrorBanner />)
    expect(screen.getByRole('alert')).toHaveTextContent('Lỗi lưu trữ')
    expect(screen.getByRole('button', { name: 'Xuất backup' })).toBeInTheDocument()
  })

  it('hidden when no error', () => {
    useTaskStore.setState({ error: undefined })
    const { container } = render(<ErrorBanner />)
    expect(container).toBeEmptyDOMElement()
  })
})
