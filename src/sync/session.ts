import type { LocalTaskRepository, RemoteTasks, SyncStatus } from './types'
import { RepoHost, SignedOutRepository } from './RepoHost'
import { SyncedTaskRepository } from './SyncedTaskRepository'

const SYNC_INTERVAL_MS = 60_000

export interface SessionDeps {
  host: RepoHost
  makeLocal(userId: string): LocalTaskRepository
  makeRemote(): RemoteTasks
  claimLegacy(local: LocalTaskRepository, userId: string): Promise<number>
  /** Re-read the task list from the host into the UI store. */
  reloadStore(): Promise<void>
  /** Empty the UI store (on sign-out). */
  resetStore(): void
  setStatus(s: SyncStatus): void
  idleStatus: SyncStatus
}

/** Owns the lifetime of one signed-in account's local database and sync loop. */
export function createSyncSession(deps: SessionDeps) {
  let current: { userId: string; synced: SyncedTaskRepository; stopTimers(): void } | null = null

  async function start(userId: string) {
    if (current?.userId === userId) return
    stop()
    const local = deps.makeLocal(userId)
    await deps.claimLegacy(local, userId)
    const synced = new SyncedTaskRepository(local, deps.makeRemote(), deps.setStatus, () => void deps.reloadStore())
    const entry = { userId, synced, stopTimers: () => {} }
    current = entry
    deps.host.use(synced)
    await deps.reloadStore() // show what is already on the device straight away
    if (current !== entry) return

    const run = () => void synced.sync()
    window.addEventListener('online', run)
    window.addEventListener('focus', run)
    const timer = window.setInterval(run, SYNC_INTERVAL_MS)
    entry.stopTimers = () => {
      window.removeEventListener('online', run)
      window.removeEventListener('focus', run)
      window.clearInterval(timer)
    }
    await synced.sync()
  }

  function stop() {
    current?.stopTimers()
    current = null
    deps.host.use(new SignedOutRepository())
    deps.resetStore()
    deps.setStatus(deps.idleStatus)
  }

  return {
    start,
    stop,
    /** Manual "try again" from the UI. */
    retry: () => current?.synced.sync() ?? Promise.resolve(),
    get userId() {
      return current?.userId ?? null
    },
  }
}
