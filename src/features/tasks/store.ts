import { create } from 'zustand'
import { DexieTaskRepository } from '../../data/DexieTaskRepository'
import type { TaskRepository } from '../../data/TaskRepository'
import {
  createTask,
  nextStatus,
  withStatus,
  type Status,
  type Task,
  type TaskInput,
} from '../../domain/task'

interface TaskState {
  tasks: Task[]
  loaded: boolean
  error?: string
  lastDeletedId?: string
  load(): Promise<void>
  add(input: TaskInput): Promise<Task | null>
  update(id: string, patch: Partial<Task>): Promise<boolean>
  cycleStatus(id: string): Promise<void>
  setStatus(id: string, s: Status): Promise<void>
  remove(id: string): Promise<void>
  undoRemove(): Promise<void>
  replaceAll(tasks: Task[]): Promise<void>
  mergeAll(tasks: Task[]): Promise<void>
}

const ERROR_MESSAGE =
  'Không thể đọc/ghi dữ liệu trên trình duyệt. Hãy xuất bản sao lưu để tránh mất dữ liệu.'

export function createTaskStore(repo: TaskRepository) {
  return create<TaskState>((set, get) => {
    // Operations are serialized so read-modify-write sequences never act on stale state.
    let queue: Promise<unknown> = Promise.resolve()
    const run = (op: () => Promise<void>): Promise<boolean> => {
      const result = queue.then(async () => {
        try {
          await op()
          set({ tasks: await repo.list(), error: undefined })
          return true
        } catch {
          set({ error: ERROR_MESSAGE })
          return false
        }
      })
      queue = result
      return result
    }
    const find = (id: string) => get().tasks.find((t) => t.id === id)

    return {
      tasks: [],
      loaded: false,
      async load() {
        await run(async () => {})
        set({ loaded: true })
      },
      async add(input) {
        let task: Task
        try {
          task = createTask(input)
        } catch {
          return null
        }
        return (await run(() => repo.put(task))) ? task : null
      },
      async update(id, patch) {
        const next = { ...patch }
        if ('title' in next) {
          const title = (next.title ?? '').trim()
          if (!title) return false
          next.title = title
        }
        let found = false
        const ok = await run(async () => {
          const t = find(id)
          if (!t) return
          found = true
          await repo.put({ ...t, ...next, updatedAt: new Date().toISOString() })
        })
        return ok && found
      },
      async cycleStatus(id) {
        await run(async () => {
          const t = find(id)
          if (t) await repo.put(withStatus(t, nextStatus(t.status)))
        })
      },
      async setStatus(id, s) {
        await run(async () => {
          const t = find(id)
          if (t) await repo.put(withStatus(t, s))
        })
      },
      async remove(id) {
        if (await run(() => repo.remove(id))) set({ lastDeletedId: id })
      },
      async undoRemove() {
        const id = get().lastDeletedId
        if (!id) return
        if (await run(() => repo.restore(id))) set({ lastDeletedId: undefined })
      },
      async replaceAll(tasks) {
        await run(async () => {
          await repo.clear()
          await repo.bulkPut(tasks)
        })
      },
      async mergeAll(tasks) {
        await run(() => repo.bulkPut(tasks))
      },
    }
  })
}

export const useTaskStore = createTaskStore(new DexieTaskRepository())
