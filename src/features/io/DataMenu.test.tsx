import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTask } from '../../domain/task'
import { useTaskStore } from '../tasks/store'
import { exportJson } from './export'
import { DataMenu } from './DataMenu'

const file = (content: string) => new File([content], 'data.json', { type: 'application/json' })

async function openImport(content: string) {
  render(<DataMenu />)
  await userEvent.click(screen.getByRole('button', { name: 'Dữ liệu' }))
  await userEvent.upload(screen.getByLabelText('Chọn tệp JSON'), file(content))
}

describe('DataMenu', () => {
  beforeEach(async () => {
    await useTaskStore.getState().replaceAll([createTask({ title: 'Cũ' })])
  })

  it('file input rejects bad file and shows an error without changing tasks', async () => {
    await openImport('not json')
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(useTaskStore.getState().tasks.map((t) => t.title)).toEqual(['Cũ'])
  })

  it('Gộp keeps existing tasks and upserts', async () => {
    await openImport(exportJson([createTask({ title: 'Mới' })]))
    expect(await screen.findByText(/1 việc/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Gộp' }))
    await waitFor(() => expect(useTaskStore.getState().tasks).toHaveLength(2))
  })

  it('Thay thế replaces all', async () => {
    await openImport(exportJson([createTask({ title: 'Mới' })]))
    await userEvent.click(await screen.findByRole('button', { name: 'Thay thế' }))
    await waitFor(() => expect(useTaskStore.getState().tasks.map((t) => t.title)).toEqual(['Mới']))
  })

  it('lists the export actions', async () => {
    render(<DataMenu />)
    await userEvent.click(screen.getByRole('button', { name: 'Dữ liệu' }))
    for (const name of ['Xuất JSON', 'Xuất CSV', 'Xuất lịch (.ics)', 'Nhập JSON'])
      expect(screen.getByText(name)).toBeInTheDocument()
  })
})
