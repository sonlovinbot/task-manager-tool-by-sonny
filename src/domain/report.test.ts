import {
  completedPerDay,
  completionRate,
  countByLabel,
  countByPriority,
  countByStatus,
  isOverdue,
  toLocalDate,
  urgentTasks,
} from './report'
import { createTask, withStatus, type Task } from './task'

const TODAY = '2026-10-16'
const mk = (over: Partial<Task> & { title?: string } = {}): Task => ({
  ...createTask({ title: over.title ?? 't' }),
  ...over,
})

describe('report', () => {
  it('empty list gives completionRate 0 (not NaN) and zero counts', () => {
    expect(completionRate([])).toBe(0)
    expect(countByStatus([])).toEqual({ todo: 0, doing: 0, done: 0 })
  })

  it('completionRate is done/total', () => {
    const tasks = [mk(), withStatus(mk(), 'done')]
    expect(completionRate(tasks)).toBe(0.5)
  })

  it('overdue boundaries use local date strings', () => {
    expect(isOverdue(mk({ dueDate: TODAY }), TODAY)).toBe(false)
    expect(isOverdue(mk({ dueDate: '2026-10-15' }), TODAY)).toBe(true)
    expect(isOverdue(mk({ dueDate: '2026-10-15', status: 'done' }), TODAY)).toBe(false)
    expect(isOverdue(mk(), TODAY)).toBe(false)
  })

  it('urgentTasks splits overdue and dueSoon with +7 boundary', () => {
    const over = mk({ dueDate: '2026-10-10' })
    const today = mk({ dueDate: TODAY })
    const edge = mk({ dueDate: '2026-10-23' })
    const far = mk({ dueDate: '2026-10-24' })
    const done = mk({ dueDate: '2026-10-17', status: 'done' })
    const { overdue, dueSoon } = urgentTasks([over, today, edge, far, done], TODAY)
    expect(overdue).toEqual([over])
    expect(dueSoon).toEqual([today, edge])
  })

  it('completedPerDay returns zero-filled days and uses local date of completedAt', () => {
    const lateLocal = new Date(2026, 9, 16, 23, 30) // 16 Oct 23:30 local
    const t = withStatus(mk(), 'done', lateLocal)
    const res = completedPerDay([t], TODAY, 7)
    expect(res).toHaveLength(7)
    expect(res[0].date).toBe('2026-10-10')
    expect(res[6]).toEqual({ date: TODAY, count: 1 })
    expect(res.slice(0, 6).every((d) => d.count === 0)).toBe(true)
    expect(completedPerDay([], TODAY, 30)).toHaveLength(30)
  })

  it('counts by priority and groups unlabeled', () => {
    const tasks = [
      mk({ priority: 'high', label: 'A' }),
      mk({ priority: 'low' }),
      mk({ label: 'A' }),
      mk(),
      mk(),
    ]
    expect(countByPriority(tasks)).toEqual({ high: 1, medium: 3, low: 1 })
    expect(countByLabel(tasks)).toEqual([
      { label: 'Không nhãn', count: 3 },
      { label: 'A', count: 2 },
    ])
  })

  it('toLocalDate formats local calendar date', () => {
    expect(toLocalDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })

  it('runs in Asia/Ho_Chi_Minh so local and UTC dates can differ', () => {
    expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(-420)
  })

  it('early-morning completion (01:30 local, still yesterday in UTC) counts on its local day', () => {
    const early = new Date(2026, 9, 16, 1, 30)
    expect(early.toISOString().slice(0, 10)).toBe('2026-10-15')
    const t = withStatus(mk(), 'done', early)
    const res = completedPerDay([t], TODAY, 7)
    expect(res[6]).toEqual({ date: TODAY, count: 1 })
    expect(res[5].count).toBe(0)
    expect(toLocalDate(early)).toBe(TODAY)
  })
})
