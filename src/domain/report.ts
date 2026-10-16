import type { Priority, Status, Task } from './task'

const pad = (n: number) => String(n).padStart(2, '0')

export function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return toLocalDate(new Date(y, m - 1, d + days))
}

export function countByStatus(tasks: Task[]): Record<Status, number> {
  const r: Record<Status, number> = { todo: 0, doing: 0, done: 0 }
  for (const t of tasks) r[t.status]++
  return r
}

export function completionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  return tasks.filter((t) => t.status === 'done').length / tasks.length
}

export function isOverdue(t: Task, today: string): boolean {
  return !!t.dueDate && t.dueDate < today && t.status !== 'done'
}

export function urgentTasks(tasks: Task[], today: string): { overdue: Task[]; dueSoon: Task[] } {
  const limit = addDays(today, 7)
  const open = tasks.filter((t) => t.status !== 'done' && t.dueDate)
  return {
    overdue: open.filter((t) => t.dueDate! < today),
    dueSoon: open.filter((t) => t.dueDate! >= today && t.dueDate! <= limit),
  }
}

export function completedPerDay(
  tasks: Task[],
  today: string,
  days: 7 | 30,
): { date: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const t of tasks) {
    if (t.status === 'done' && t.completedAt) {
      const day = toLocalDate(new Date(t.completedAt))
      counts.set(day, (counts.get(day) ?? 0) + 1)
    }
  }
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i - (days - 1))
    return { date, count: counts.get(date) ?? 0 }
  })
}

export function countByPriority(tasks: Task[]): Record<Priority, number> {
  const r: Record<Priority, number> = { high: 0, medium: 0, low: 0 }
  for (const t of tasks) r[t.priority]++
  return r
}

export function countByLabel(tasks: Task[]): { label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const t of tasks) {
    const label = t.label?.trim() || 'Không nhãn'
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
}
