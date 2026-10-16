import { CheckCircle, CloudSlash, CircleNotch } from '@phosphor-icons/react'
import { useSyncStatus } from './syncStatus'

export function syncLabel(state: string, pending: number): string {
  if (state === 'error') return pending > 0 ? `${pending} thay đổi chưa đồng bộ` : 'Chưa đồng bộ được'
  if (state === 'syncing') return 'Đang đồng bộ…'
  return 'Đã đồng bộ'
}

export function SyncStatusLine() {
  const { state, pending } = useSyncStatus()
  const Icon = state === 'error' ? CloudSlash : state === 'syncing' ? CircleNotch : CheckCircle
  return (
    <div className={`sync-line ${state}`} role="status">
      <Icon size={16} aria-hidden />
      {syncLabel(state, pending)}
    </div>
  )
}
