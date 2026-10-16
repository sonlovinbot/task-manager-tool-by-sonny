import { ArrowsClockwise, WarningCircle } from '@phosphor-icons/react'
import { syncSession } from './boot'
import { useSyncStatus } from './syncStatus'

/** Shown above the page whenever the last attempt to reach the server failed. */
export function SyncBanner() {
  const { state, error, pending } = useSyncStatus()
  if (state !== 'error') return null
  return (
    <div className="banner" role="alert">
      <WarningCircle size={22} aria-hidden />
      <span>
        {error}
        {pending > 0 && <> ({pending} thay đổi chưa lên máy chủ)</>}
      </span>
      <button className="btn sm" type="button" onClick={() => void syncSession.retry()}>
        <ArrowsClockwise size={16} aria-hidden />
        Thử lại
      </button>
    </div>
  )
}
