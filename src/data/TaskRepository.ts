import type { Task } from '../domain/task'

export interface TaskRepository {
  list(): Promise<Task[]>
  get(id: string): Promise<Task | undefined>
  put(task: Task): Promise<void>
  remove(id: string, now?: Date): Promise<void>
  restore(id: string): Promise<void>
  bulkPut(tasks: Task[]): Promise<void>
  /** Atomically replace every row; on failure existing data is left untouched. */
  replaceAll(tasks: Task[]): Promise<void>
  clear(): Promise<void>
}
