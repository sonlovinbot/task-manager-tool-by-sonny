import type { Priority, Status, Subtask, Task } from '../domain/task'

/** Columns of public.tasks (see supabase/schema.sql), minus user_id which the server fills in. */
export interface TaskRow {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  due_date: string | null
  label: string | null
  subtasks: Subtask[]
  created_at: string
  updated_at: string
  completed_at: string | null
  deleted_at: string | null
}

export const TASK_COLUMNS =
  'id,title,description,status,priority,due_date,label,subtasks,created_at,updated_at,completed_at,deleted_at'

export function toRow(t: Task): TaskRow {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    due_date: t.dueDate ?? null,
    label: t.label ?? null,
    subtasks: t.subtasks,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
    completed_at: t.completedAt ?? null,
    deleted_at: t.deletedAt ?? null,
  }
}

// Postgres returns timestamptz as "2026-10-16T03:00:00+00:00"; normalise to the app's ISO form.
const iso = (v: string) => new Date(v).toISOString()

export function fromRow(r: TaskRow): Task {
  const t: Task = {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    status: r.status,
    priority: r.priority,
    subtasks: Array.isArray(r.subtasks) ? r.subtasks : [],
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  }
  if (r.due_date) t.dueDate = r.due_date
  if (r.label) t.label = r.label
  if (r.completed_at) t.completedAt = iso(r.completed_at)
  if (r.deleted_at) t.deletedAt = iso(r.deleted_at)
  return t
}
