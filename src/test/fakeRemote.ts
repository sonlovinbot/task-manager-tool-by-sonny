import type { Task } from '../domain/task'
import type { RemoteTasks } from '../sync/types'

export class FakeRemote implements RemoteTasks {
  rows = new Map<string, Task>()
  failWith: unknown = null
  fetchCalls = 0
  upsertCalls = 0

  constructor(seed: Task[] = []) {
    seed.forEach((t) => this.rows.set(t.id, t))
  }
  async fetchAll() {
    this.fetchCalls++
    if (this.failWith) throw this.failWith
    return [...this.rows.values()]
  }
  async upsert(tasks: Task[]) {
    this.upsertCalls++
    if (this.failWith) throw this.failWith
    tasks.forEach((t) => this.rows.set(t.id, t))
  }
}
