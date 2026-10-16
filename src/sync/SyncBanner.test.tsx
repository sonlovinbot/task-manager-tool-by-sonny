import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { syncSession } from './boot'
import { SyncBanner } from './SyncBanner'
import { SyncStatusLine, syncLabel } from './SyncStatusLine'
import { useSyncStatus } from './syncStatus'

vi.mock('./boot', () => ({ syncSession: { retry: vi.fn().mockResolvedValue(undefined) } }))

describe('sync status UI', () => {
  afterEach(() => useSyncStatus.getState().set({ state: 'idle', pending: 0 }))

  it('banner stays hidden while everything is fine', () => {
    useSyncStatus.getState().set({ state: 'idle', pending: 0 })
    const { container } = render(<SyncBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('banner explains the failure, counts unsent changes and retries on click', async () => {
    useSyncStatus.getState().set({ state: 'error', pending: 3, error: 'Chưa có bảng tasks trên Supabase.' })
    render(<SyncBanner />)
    expect(screen.getByRole('alert')).toHaveTextContent('Chưa có bảng tasks trên Supabase.')
    expect(screen.getByRole('alert')).toHaveTextContent('3 thay đổi chưa lên máy chủ')
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(syncSession.retry).toHaveBeenCalledTimes(1)
  })

  it('status line labels', () => {
    expect(syncLabel('idle', 0)).toBe('Đã đồng bộ')
    expect(syncLabel('syncing', 2)).toBe('Đang đồng bộ…')
    expect(syncLabel('error', 2)).toBe('2 thay đổi chưa đồng bộ')
    expect(syncLabel('error', 0)).toBe('Chưa đồng bộ được')
  })

  it('status line reflects the store', () => {
    useSyncStatus.getState().set({ state: 'error', pending: 1 })
    render(<SyncStatusLine />)
    expect(screen.getByRole('status')).toHaveTextContent('1 thay đổi chưa đồng bộ')
  })
})
