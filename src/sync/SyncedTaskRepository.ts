import type { TaskRepository } from '../data/TaskRepository'
import type { Task } from '../domain/task'
import { mergeTasks } from './merge'
import { translateSyncError } from './syncErrors'
import type { LocalTaskRepository, RemoteTasks, SyncStatus } from './types'

/**
 * Local-first repository. Every write lands on the device first, then is pushed to the server
 * in the background. A failed push never loses data: the row stays "pending" and is retried by
 * the next push, by sync(), or when the connection comes back.
 */
export class SyncedTaskRepository implements TaskRepository {
  private queue: Promise<unknown> = Promise.resolve()
  private syncPromise?: Promise<void>
  private pending = new Set<string>()
  private lastSyncedAt?: string

  private local: LocalTaskRepository
  private remote: RemoteTasks
  private report: (status: SyncStatus) => void
  /** Called after rows were pulled from the server into the device. */
  private onPulled: () => void

  constructor(
    local: LocalTaskRepository,
    remote: RemoteTasks,
    report: (status: SyncStatus) => void,
    onPulled: () => void = () => {},
  ) {
    this.local = local
    this.remote = remote
    this.report = report
    this.onPulled = onPulled
  }

  // ---- reads: always from the device ----
  list() {
    return this.local.list()
  }
  get(id: string) {
    return this.local.get(id)
  }

  // ---- writes: device first, then push ----
  async put(task: Task) {
    await this.local.put(task)
    this.push([task.id])
  }

  async remove(id: string, now: Date = new Date()) {
    await this.local.remove(id, now)
    this.push([id])
  }

  async restore(id: string) {
    await this.local.restore(id)
    this.push([id])
  }

  /** Used by imports: the imported copy should win over whatever the server holds. */
  async bulkPut(tasks: Task[]) {
    const stamped = this.stamp(tasks)
    await this.local.bulkPut(stamped)
    this.push(stamped.map((t) => t.id))
  }

  async replaceAll(tasks: Task[]) {
    const now = new Date().toISOString()
    const stamped = this.stamp(tasks, now)
    const keep = new Set(stamped.map((t) => t.id))
    const before = await this.local.listAll()
    // Rows that disappear become tombstones so the server (and other devices) delete them too.
    const tombstones = before
      .filter((t) => !keep.has(t.id))
      .map((t) => (t.deletedAt ? t : { ...t, deletedAt: now, updatedAt: now }))
    await this.local.replaceAll([...stamped, ...tombstones])
    this.push([...stamped, ...tombstones.filter((t) => t.deletedAt === now)].map((t) => t.id))
  }

  clear() {
    return this.replaceAll([])
  }

  // ---- sync ----
  /** Resolves when every queued push and sync has finished. */
  idle(): Promise<void> {
    return this.queue.then(
      () => {},
      () => {},
    )
  }

  /** Pull everything, merge by updatedAt, and push whatever the server is missing. */
  sync(): Promise<void> {
    if (this.syncPromise) return this.syncPromise
    const run = this.queue.then(() => this.doSync())
    this.syncPromise = run.finally(() => {
      this.syncPromise = undefined
    })
    this.queue = this.syncPromise
    return this.syncPromise
  }

  private stamp(tasks: Task[], now: string = new Date().toISOString()): Task[] {
    return tasks.map((t) => ({ ...t, updatedAt: now }))
  }

  private emit(state: SyncStatus['state'], error?: string) {
    this.report({ state, pending: this.pending.size, lastSyncedAt: this.lastSyncedAt, error })
  }

  private push(ids: string[]) {
    ids.forEach((id) => this.pending.add(id))
    this.emit('syncing')
    this.queue = this.queue.then(() => this.flush())
  }

  private async flush() {
    if (this.pending.size === 0) return
    const ids = [...this.pending]
    // Taken out first: a write that lands while we upload re-adds its id and triggers another flush.
    ids.forEach((id) => this.pending.delete(id))
    try {
      const rows = (await Promise.all(ids.map((id) => this.local.get(id)))).filter((t): t is Task => !!t)
      await this.remote.upsert(rows)
      this.lastSyncedAt = new Date().toISOString()
      this.emit(this.pending.size > 0 ? 'syncing' : 'idle')
    } catch (e) {
      ids.forEach((id) => this.pending.add(id))
      this.emit('error', translateSyncError(e))
    }
  }

  private async doSync() {
    this.emit('syncing')
    try {
      const [remoteRows, localRows] = await Promise.all([this.remote.fetchAll(), this.local.listAll()])
      const plan = mergeTasks(localRows, remoteRows)
      if (plan.toLocal.length > 0) await this.local.bulkPut(plan.toLocal)
      if (plan.toRemote.length > 0) await this.remote.upsert(plan.toRemote)
      this.pending.clear()
      this.lastSyncedAt = new Date().toISOString()
      this.emit('idle')
      if (plan.toLocal.length > 0) this.onPulled()
    } catch (e) {
      this.emit('error', translateSyncError(e))
    }
  }
}
