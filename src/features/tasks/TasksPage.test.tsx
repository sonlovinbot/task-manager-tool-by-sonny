import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { createTask, type Task } from '../../domain/task'
import { TasksPage } from './TasksPage'
import { useTaskStore } from './store'

async function renderPage(seed: Task[] = [], url = '/') {
  await useTaskStore.getState().replaceAll(seed)
  render(
    <MemoryRouter initialEntries={[url]}>
      <TasksPage />
    </MemoryRouter>,
  )
}

describe('TasksPage', () => {
  beforeEach(async () => {
    await useTaskStore.getState().replaceAll([])
  })

  it('typing a title and pressing Enter adds a task', async () => {
    await renderPage()
    await userEvent.type(screen.getByPlaceholderText('Thêm việc mới…'), 'Viết báo cáo{Enter}')
    expect(await screen.findByText('Viết báo cáo')).toBeInTheDocument()
  })

  it('whitespace-only title adds nothing', async () => {
    await renderPage()
    await userEvent.type(screen.getByPlaceholderText('Thêm việc mới…'), '   {Enter}')
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(useTaskStore.getState().tasks).toHaveLength(0)
  })

  it('status tab shows only that status and counts match', async () => {
    const a = createTask({ title: 'A' })
    const b = createTask({ title: 'B', status: 'doing' })
    await renderPage([a, b])
    expect(screen.getByRole('tab', { name: /Cần làm\s*1/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: /Đang làm/ }))
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.queryByText('A')).not.toBeInTheDocument()
  })

  it('clicking the status control cycles Cần làm → Đang làm → Đã xong', async () => {
    await renderPage([createTask({ title: 'A' })])
    const btn = screen.getByRole('button', { name: 'Đổi trạng thái: A' })
    const row = screen.getByRole('listitem')
    expect(within(row).getByText('Cần làm')).toBeInTheDocument()
    await userEvent.click(btn)
    expect(await within(row).findByText('Đang làm')).toBeInTheDocument()
    await userEvent.click(btn)
    expect(await within(row).findByText('Đã xong')).toBeInTheDocument()
  })

  it('filter state is read from URL (?status=doing)', async () => {
    const a = createTask({ title: 'A' })
    const b = createTask({ title: 'B', status: 'doing' })
    await renderPage([a, b], '/?status=doing')
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.queryByText('A')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Đang làm/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('overdue due date has the overdue class', async () => {
    await renderPage([createTask({ title: 'A', dueDate: '2000-01-01' })])
    expect(screen.getByText('2000-01-01')).toHaveClass('overdue')
  })

  it('search ignores diacritics', async () => {
    await renderPage([createTask({ title: 'Bán hàng' }), createTask({ title: 'Học bài' })])
    await userEvent.type(screen.getByRole('searchbox'), 'ban hang')
    expect(screen.getByText('Bán hàng')).toBeInTheDocument()
    expect(screen.queryByText('Học bài')).not.toBeInTheDocument()
  })
})

describe('TasksPage voice input', () => {
  it('voice text fills the input without creating a task', async () => {
    class R {
      lang = ''
      onresult: ((e: unknown) => void) | null = null
      onerror = null
      onend = null
      constructor() {
        ;(window as any).__rec = this
      }
      start() {}
      stop() {}
    }
    ;(window as any).webkitSpeechRecognition = R
    await renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Nhập bằng giọng nói' }))
    act(() => (window as any).__rec.onresult({ results: [[{ transcript: 'Gọi khách hàng' }]] }))
    expect(screen.getByPlaceholderText('Thêm việc mới…')).toHaveValue('Gọi khách hàng')
    expect(useTaskStore.getState().tasks).toHaveLength(0)
    delete (window as any).webkitSpeechRecognition
  })
})
