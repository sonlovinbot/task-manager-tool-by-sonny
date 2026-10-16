import type { TaskRepository } from '../data/TaskRepository'
import type { Task } from '../domain/task'

/** The cloud side. Rows are scoped to the signed-in user by RLS, so no user id is passed. */
export interface RemoteTasks {
  fetchAll(): Promise<Task[]>
  upsert(tasks: Task[]): Promise<void>
}

/** The on-device side: a TaskRepository that can also expose soft-deleted rows. */
export interface LocalTaskRepository extends TaskRepository {
  listAll(): Promise<Task[]>
}

export type SyncState = 'idle' | 'syncing' | 'error'

export interface SyncStatus {
  state: SyncState
  /** Number of local changes not yet confirmed by the server. */
  pending: number
  lastSyncedAt?: string
  error?: string
}
