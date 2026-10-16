import type { TaskRepository } from '../data/TaskRepository'
import type { Task } from '../domain/task'

/** Used while nobody is signed in: shows nothing and refuses writes so data can never leak between accounts. */
export class SignedOutRepository implements TaskRepository {
  async list() {
    return []
  }
  async get() {
    return undefined
  }
  private refuse(): never {
    throw new Error('NOT_SIGNED_IN')
  }
  async put(_task: Task) {
    this.refuse()
  }
  async remove() {
    this.refuse()
  }
  async restore() {
    this.refuse()
  }
  async bulkPut() {
    this.refuse()
  }
  async replaceAll() {
    this.refuse()
  }
  async clear() {
    this.refuse()
  }
}

/** A stable repository the store is built on, whose target changes when the signed-in account changes. */
export class RepoHost implements TaskRepository {
  private delegate: TaskRepository

  constructor(delegate: TaskRepository) {
    this.delegate = delegate
  }

  use(repo: TaskRepository) {
    this.delegate = repo
  }
  list() {
    return this.delegate.list()
  }
  get(id: string) {
    return this.delegate.get(id)
  }
  put(task: Task) {
    return this.delegate.put(task)
  }
  remove(id: string, now?: Date) {
    return this.delegate.remove(id, now)
  }
  restore(id: string) {
    return this.delegate.restore(id)
  }
  bulkPut(tasks: Task[]) {
    return this.delegate.bulkPut(tasks)
  }
  replaceAll(tasks: Task[]) {
    return this.delegate.replaceAll(tasks)
  }
  clear() {
    return this.delegate.clear()
  }
}
