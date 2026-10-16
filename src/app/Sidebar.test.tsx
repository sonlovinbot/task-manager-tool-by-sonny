import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { toLocalDate } from '../domain/report'
import { createTask, withStatus } from '../domain/task'
import { useTaskStore } from '../features/tasks/store'
import { Sidebar } from './Sidebar'

const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

async function renderSidebar(url = '/') {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Sidebar />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  beforeEach(async () => {
    await useTaskStore.getState().replaceAll([])
  })

  it('shows done-this-week and overdue counts', async () => {
    await useTaskStore.getState().replaceAll([
      withStatus(createTask({ title: 'a' }), 'done', daysAgo(1)),
      withStatus(createTask({ title: 'b' }), 'done', daysAgo(3)),
      withStatus(createTask({ title: 'old' }), 'done', daysAgo(20)),
      createTask({ title: 'late', dueDate: toLocalDate(daysAgo(2)) }),
    ])
    await renderSidebar()
    expect(screen.getByTestId('done-week')).toHaveTextContent('+2')
    expect(screen.getByTestId('overdue-count')).toHaveTextContent('1')
  })

  it('label tiles link to a label filter, most used first, and toggle off when active', async () => {
    await useTaskStore.getState().replaceAll([
      createTask({ title: '1', label: 'Công việc' }),
      createTask({ title: '2', label: 'Công việc' }),
      createTask({ title: '3', label: 'Học tập' }),
      createTask({ title: '4' }),
    ])
    await renderSidebar()
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/?label=C%C3%B4ng%20vi%E1%BB%87c')
    expect(links[0]).toHaveTextContent('2 việc')
    expect(links).toHaveLength(2)
  })

  it('active label tile links back to no filter', async () => {
    await useTaskStore.getState().replaceAll([createTask({ title: '1', label: 'Học tập' })])
    await renderSidebar('/?label=H%E1%BB%8Dc%20t%E1%BA%ADp')
    const link = screen.getByRole('link', { name: /Học tập/ })
    expect(link).toHaveAttribute('aria-current', 'true')
    expect(link).toHaveAttribute('href', '/')
  })

  it('shows a hint when there are no labels', async () => {
    await renderSidebar()
    expect(screen.getByText(/Gắn nhãn cho việc/)).toBeInTheDocument()
  })
})
