import { createTask, type Task } from '../domain/task'
import { mergeTasks } from './merge'
import { fromRow, toRow, type TaskRow } from './remoteMapping'
import { translateSyncError } from './syncErrors'

const at = (iso: string, over: Partial<Task> = {}): Task => ({
  ...createTask({ title: over.title ?? 't' }, new Date(iso)),
  ...over,
})

describe('mergeTasks (last writer wins)', () => {
  it('sends local-only rows up and pulls remote-only rows down', () => {
    const l = at('2026-01-01T00:00:00Z', { title: 'local' })
    const r = at('2026-01-01T00:00:00Z', { title: 'remote' })
    const plan = mergeTasks([l], [r])
    expect(plan.toRemote).toEqual([l])
    expect(plan.toLocal).toEqual([r])
  })

  it('newer side wins; equal timestamps change nothing', () => {
    const base = at('2026-01-01T00:00:00Z', { title: 'base' })
    const newerLocal = { ...base, title: 'L', updatedAt: '2026-03-01T00:00:00.000Z' }
    const newerRemote = { ...base, title: 'R', updatedAt: '2026-05-01T00:00:00.000Z' }
    expect(mergeTasks([newerLocal], [base])).toEqual({ toLocal: [], toRemote: [newerLocal] })
    expect(mergeTasks([base], [newerRemote])).toEqual({ toLocal: [newerRemote], toRemote: [] })
    expect(mergeTasks([base], [{ ...base }])).toEqual({ toLocal: [], toRemote: [] })
  })

  it('compares instants, not strings (+00:00 vs Z)', () => {
    const l = { ...at('2026-01-01T00:00:00Z'), updatedAt: '2026-01-01T00:00:00.000Z' }
    const r = { ...l, title: 'changed', updatedAt: '2026-01-01T07:00:00+07:00' }
    expect(mergeTasks([l], [r])).toEqual({ toLocal: [], toRemote: [] })
  })

  it('a newer delete on one side propagates as a tombstone', () => {
    const t = at('2026-01-01T00:00:00Z')
    const deleted = { ...t, deletedAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }
    expect(mergeTasks([deleted], [t]).toRemote).toEqual([deleted])
    expect(mergeTasks([t], [deleted]).toLocal).toEqual([deleted])
  })
})

describe('row mapping', () => {
  it('round-trips a full task through the database column names', () => {
    const t: Task = {
      ...at('2026-10-16T03:00:00Z', { title: 'Nộp lệ phí' }),
      description: 'ghi chú',
      priority: 'high',
      dueDate: '2026-10-20',
      label: 'Công việc',
      subtasks: [{ id: 's1', title: 'a', done: true }],
      status: 'done',
      completedAt: '2026-10-17T01:00:00.000Z',
    }
    const row = toRow(t)
    expect(row.due_date).toBe('2026-10-20')
    expect(Object.keys(row)).not.toContain('user_id')
    expect(fromRow(row)).toEqual(t)
  })

  it('maps nulls to absent fields and normalises Postgres timestamps', () => {
    const row: TaskRow = {
      id: 'x', title: 'a', description: '', status: 'todo', priority: 'medium', due_date: null, label: null,
      subtasks: [], created_at: '2026-10-16T10:00:00+07:00', updated_at: '2026-10-16T03:00:00+00:00',
      completed_at: null, deleted_at: null,
    }
    const t = fromRow(row)
    expect(t).not.toHaveProperty('dueDate')
    expect(t).not.toHaveProperty('deletedAt')
    expect(t.createdAt).toBe('2026-10-16T03:00:00.000Z')
    expect(t.updatedAt).toBe('2026-10-16T03:00:00.000Z')
  })
})

describe('translateSyncError', () => {
  it.each([
    [{ code: 'PGRST205' }, 'Chưa có bảng tasks'],
    [{ code: '42P01' }, 'Chưa có bảng tasks'],
    [{ code: '42501', message: 'new row violates row-level security policy' }, 'từ chối ghi'],
    [{ code: 'PGRST301' }, 'hết hạn'],
    [{ status: 401 }, 'hết hạn'],
    [{ code: '23514' }, 'không hợp lệ'],
    [{ code: '42703' }, 'chưa khớp'],
    [{ message: 'TypeError: Failed to fetch' }, 'Mất kết nối'],
  ])('explains %j', (err, fragment) => {
    expect(translateSyncError(err)).toContain(fragment)
  })

  it('never shows the raw server message for unknown errors', () => {
    const msg = translateSyncError({ code: 'XX000', message: 'internal: secret detail' })
    expect(msg).toContain('XX000')
    expect(msg).not.toContain('secret')
  })
})
