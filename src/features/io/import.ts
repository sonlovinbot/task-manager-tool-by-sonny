import { PRIORITIES, STATUSES, type Subtask, type Task } from '../../domain/task'

export type ImportResult =
  | { ok: true; tasks: Task[]; skipped: number }
  | { ok: false; error: string }

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined)

function toSubtasks(v: unknown): Subtask[] {
  if (!Array.isArray(v)) return []
  return v.filter(isObj).flatMap((s) => {
    const title = typeof s.title === 'string' ? s.title.trim() : ''
    return title ? [{ id: str(s.id) ?? crypto.randomUUID(), title, done: s.done === true }] : []
  })
}

function toTask(raw: unknown, nowIso: string): Task | null {
  if (!isObj(raw)) return null
  const title = typeof raw.title === 'string' ? raw.title.trim() : ''
  if (!title) return null
  const status = raw.status ?? 'todo'
  const priority = raw.priority ?? 'medium'
  if (!STATUSES.includes(status as never) || !PRIORITIES.includes(priority as never)) return null
  const task: Task = {
    id: str(raw.id) ?? crypto.randomUUID(),
    title,
    description: typeof raw.description === 'string' ? raw.description : '',
    status: status as Task['status'],
    priority: priority as Task['priority'],
    subtasks: toSubtasks(raw.subtasks),
    createdAt: str(raw.createdAt) ?? nowIso,
    updatedAt: str(raw.updatedAt) ?? nowIso,
  }
  const due = str(raw.dueDate)
  if (due && /^\d{4}-\d{2}-\d{2}$/.test(due)) task.dueDate = due
  const label = str(raw.label)
  if (label) task.label = label
  const completedAt = str(raw.completedAt)
  if (completedAt && task.status === 'done') task.completedAt = completedAt
  const deletedAt = str(raw.deletedAt)
  if (deletedAt) task.deletedAt = deletedAt
  return task
}

export function parseImport(text: string): ImportResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Tệp không phải JSON hợp lệ.' }
  }
  if (!isObj(data) || data.version !== 1 || !Array.isArray(data.tasks)) {
    return { ok: false, error: 'Tệp không đúng định dạng sao lưu của ứng dụng (version 1).' }
  }
  const nowIso = new Date().toISOString()
  const byId = new Map<string, Task>()
  let skipped = 0
  for (const raw of data.tasks) {
    const t = toTask(raw, nowIso)
    if (t) byId.set(t.id, t)
    else skipped++
  }
  return { ok: true, tasks: [...byId.values()], skipped }
}
