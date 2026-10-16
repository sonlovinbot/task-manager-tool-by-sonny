import type { TaskRepository } from '../data/TaskRepository'
import type { Task } from '../domain/task'

export class FakeRepo implements TaskRepository {
  rows = new Map<string, Task>()
  failing = false

  constructor(seed: Task[] = []) {
    seed.forEach((t) => this.rows.set(t.id, t))
  }
  private guard() {
    if (this.failing) throw new Error('boom')
  }
  async list() {
    this.guard()
    return [...this.rows.values()]
      .filter((t) => !t.deletedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  async get(id: string) {
    this.guard()
    return this.rows.get(id)
  }
  async put(t: Task) {
    this.guard()
    this.rows.set(t.id, t)
  }
  async remove(id: string, now = new Date()) {
    this.guard()
    const t = this.rows.get(id)
    if (t) this.rows.set(id, { ...t, deletedAt: now.toISOString() })
  }
  async restore(id: string) {
    this.guard()
    const t = this.rows.get(id)
    if (t) {
      const { deletedAt: _d, ...rest } = t
      this.rows.set(id, rest)
    }
  }
  async bulkPut(ts: Task[]) {
    this.guard()
    ts.forEach((t) => this.rows.set(t.id, t))
  }
  async clear() {
    this.guard()
    this.rows.clear()
  }
}
