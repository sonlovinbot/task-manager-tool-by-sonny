import Dexie, { type EntityTable } from 'dexie'
import type { Task } from '../domain/task'
import type { TaskRepository } from './TaskRepository'

export class DexieTaskRepository implements TaskRepository {
  private db: Dexie & { tasks: EntityTable<Task, 'id'> }

  constructor(dbName = 'task-manager') {
    this.db = new Dexie(dbName) as Dexie & { tasks: EntityTable<Task, 'id'> }
    this.db.version(1).stores({ tasks: 'id, status, createdAt, deletedAt' })
  }

  async list(): Promise<Task[]> {
    const all = await this.db.tasks.toArray()
    return all
      .filter((t) => !t.deletedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  /** Every row including soft-deleted ones. Used by sync, never by the UI. */
  listAll(): Promise<Task[]> {
    return this.db.tasks.toArray()
  }

  get(id: string): Promise<Task | undefined> {
    return this.db.tasks.get(id)
  }

  async put(task: Task): Promise<void> {
    await this.db.tasks.put(task)
  }

  async remove(id: string, now: Date = new Date()): Promise<void> {
    await this.db.tasks.update(id, { deletedAt: now.toISOString(), updatedAt: now.toISOString() })
  }

  async restore(id: string): Promise<void> {
    const t = await this.db.tasks.get(id)
    if (!t) return
    const { deletedAt: _deletedAt, ...rest } = t
    await this.db.tasks.put({ ...rest, updatedAt: new Date().toISOString() })
  }

  async bulkPut(tasks: Task[]): Promise<void> {
    await this.db.tasks.bulkPut(tasks)
  }

  async replaceAll(tasks: Task[]): Promise<void> {
    await this.db.transaction('rw', this.db.tasks, async () => {
      await this.db.tasks.clear()
      await this.db.tasks.bulkPut(tasks)
    })
  }

  async clear(): Promise<void> {
    await this.db.tasks.clear()
  }
}
