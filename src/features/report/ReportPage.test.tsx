import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { toLocalDate } from '../../domain/report'
import { createTask, withStatus } from '../../domain/task'
import { useTaskStore } from '../tasks/store'
import { ReportPage } from './ReportPage'

const addDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return toLocalDate(d)
}

async function renderReport(seed = [] as ReturnType<typeof createTask>[]) {
  await useTaskStore.getState().replaceAll(seed)
  render(
    <MemoryRouter>
      <ReportPage />
    </MemoryRouter>,
  )
}

describe('ReportPage', () => {
  it('empty store shows 0 tasks, 0% and an empty-state message (no NaN)', async () => {
    await renderReport()
    expect(screen.getByTestId('total')).toHaveTextContent('0')
    expect(screen.getByTestId('rate')).toHaveTextContent('0%')
    expect(screen.getByText('Chưa có việc nào để báo cáo.')).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('NaN')
  })

  it('seeded tasks show correct totals, rate, overdue count', async () => {
    await renderReport([
      createTask({ title: 'A', dueDate: addDays(-2) }),
      withStatus(createTask({ title: 'B' }), 'done'),
      createTask({ title: 'C', status: 'doing' }),
      createTask({ title: 'D' }),
    ])
    expect(screen.getByTestId('total')).toHaveTextContent('4')
    expect(screen.getByTestId('rate')).toHaveTextContent('25%')
    expect(screen.getByTestId('overdue')).toHaveTextContent('1')
  })

  it('urgent list shows overdue and due-in-7-days tasks', async () => {
    await renderReport([
      createTask({ title: 'Trễ', dueDate: addDays(-1) }),
      createTask({ title: 'Sắp tới', dueDate: addDays(3) }),
      createTask({ title: 'Xa', dueDate: addDays(30) }),
    ])
    const list = screen.getByRole('region', { name: 'Cần xử lý gấp' })
    expect(within(list).getByText('Trễ')).toBeInTheDocument()
    expect(within(list).getByText('Sắp tới')).toBeInTheDocument()
    expect(within(list).queryByText('Xa')).not.toBeInTheDocument()
  })

  it('switching 7/30 changes the number of trend days', async () => {
    await renderReport([createTask({ title: 'A' })])
    expect(screen.getByTestId('trend')).toHaveAttribute('data-days', '7')
    await userEvent.click(screen.getByRole('button', { name: '30 ngày' }))
    expect(screen.getByTestId('trend')).toHaveAttribute('data-days', '30')
  })
})
