export type Status = 'todo' | 'doing' | 'done'
export type Priority = 'high' | 'medium' | 'low'

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  dueDate?: string
  label?: string
  subtasks: Subtask[]
  createdAt: string
  updatedAt: string
  completedAt?: string
  deletedAt?: string
}

export const STATUSES: Status[] = ['todo', 'doing', 'done']
export const PRIORITIES: Priority[] = ['high', 'medium', 'low']

export type TaskInput = { title: string } & Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>

export function createTask(input: TaskInput, now: Date = new Date()): Task {
  const title = input.title.trim()
  if (!title) throw new Error('EMPTY_TITLE')
  const iso = now.toISOString()
  return {
    description: '',
    status: 'todo',
    priority: 'medium',
    subtasks: [],
    ...input,
    title,
    id: crypto.randomUUID(),
    createdAt: iso,
    updatedAt: iso,
  }
}

export function nextStatus(s: Status): Status {
  return STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length]
}

export function withStatus(t: Task, s: Status, now: Date = new Date()): Task {
  const iso = now.toISOString()
  const next: Task = { ...t, status: s, updatedAt: iso }
  if (s === 'done') next.completedAt = iso
  else delete next.completedAt
  return next
}

export interface TaskFilter {
  status?: Status
  priority?: Priority
  label?: string
  q?: string
}

export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

export function filterTasks(tasks: Task[], f: TaskFilter): Task[] {
  const q = f.q ? normalizeText(f.q.trim()) : ''
  return tasks.filter(
    (t) =>
      (!f.status || t.status === f.status) &&
      (!f.priority || t.priority === f.priority) &&
      (!f.label || t.label === f.label) &&
      (!q || normalizeText(t.title).includes(q)),
  )
}
