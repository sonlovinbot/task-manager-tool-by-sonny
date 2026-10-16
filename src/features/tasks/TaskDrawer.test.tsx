import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { createTask } from '../../domain/task'
import { TasksPage } from './TasksPage'
import { useTaskStore } from './store'

async function openDrawer(title = 'Việc A', extra = {}) {
  await useTaskStore.getState().replaceAll([createTask({ title, ...extra })])
  render(
    <MemoryRouter>
      <TasksPage />
    </MemoryRouter>,
  )
  await userEvent.click(screen.getByRole('button', { name: title }))
  return screen.getByRole('dialog', { name: 'Chi tiết công việc' })
}
const task = () => useTaskStore.getState().tasks[0]

describe('TaskDrawer', () => {
  it('editing title/description/due/priority/label persists to the store', async () => {
    await openDrawer()
    const title = screen.getByLabelText('Tiêu đề')
    await userEvent.clear(title)
    await userEvent.type(title, 'Tên mới')
    await userEvent.tab()
    await userEvent.type(screen.getByLabelText('Mô tả'), 'Ghi chú')
    await userEvent.tab()
    await userEvent.type(screen.getByLabelText('Hạn'), '2026-12-31')
    await userEvent.selectOptions(screen.getByLabelText('Ưu tiên'), 'high')
    await userEvent.type(screen.getByLabelText('Nhãn'), 'Công việc')
    await userEvent.tab()
    expect(task()).toMatchObject({
      title: 'Tên mới',
      description: 'Ghi chú',
      dueDate: '2026-12-31',
      priority: 'high',
      label: 'Công việc',
    })
  })

  it('clearing the title is rejected and previous title is kept', async () => {
    await openDrawer('Giữ nguyên')
    const title = screen.getByLabelText('Tiêu đề')
    await userEvent.clear(title)
    await userEvent.tab()
    expect(task().title).toBe('Giữ nguyên')
    expect(screen.getByLabelText('Tiêu đề')).toHaveValue('Giữ nguyên')
  })

  it('adding, toggling and deleting a subtask updates the progress', async () => {
    await openDrawer()
    const input = screen.getByLabelText('Thêm việc con')
    await userEvent.type(input, 'Bước 1{Enter}')
    await userEvent.type(screen.getByLabelText('Thêm việc con'), 'Bước 2{Enter}')
    expect(task().subtasks).toHaveLength(2)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Bước 1' }))
    expect(task().subtasks.filter((s) => s.done)).toHaveLength(1)
    expect(await screen.findByText('1/2')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Xoá việc con: Bước 2' }))
    expect(task().subtasks).toHaveLength(1)
  })

  it('delete shows toast and "Hoàn tác" restores the task', async () => {
    await openDrawer('Sẽ xoá')
    await userEvent.click(screen.getByRole('button', { name: 'Xoá việc' }))
    expect(screen.queryByText('Sẽ xoá')).not.toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Hoàn tác' }))
    expect(await screen.findByText('Sẽ xoá')).toBeInTheDocument()
  })
})
