import { createTask } from '../../domain/task'
import { exportJson } from './export'
import { parseImport } from './import'

const wrap = (tasks: unknown[]) => JSON.stringify({ version: 1, tasks })

describe('parseImport', () => {
  it('invalid JSON returns ok:false', () => {
    expect(parseImport('{nope')).toMatchObject({ ok: false })
  })
  it('wrong shape or version returns ok:false', () => {
    expect(parseImport('[]')).toMatchObject({ ok: false })
    expect(parseImport(JSON.stringify({ version: 2, tasks: [] }))).toMatchObject({ ok: false })
    expect(parseImport(JSON.stringify({ version: 1, tasks: 'x' }))).toMatchObject({ ok: false })
  })
  it('round-trips an export', () => {
    const t = createTask({ title: 'a', dueDate: '2026-12-31', label: 'L' })
    const r = parseImport(exportJson([t]))
    expect(r).toEqual({ ok: true, tasks: [t], skipped: 0 })
  })
  it('unknown status entry is skipped and counted', () => {
    const good = createTask({ title: 'ok' })
    const r = parseImport(
      wrap([good, { ...good, id: 'x', status: 'weird' }, { ...good, id: 'y', title: '  ' }]),
    )
    expect(r).toMatchObject({ ok: true, skipped: 2 })
    if (r.ok) expect(r.tasks).toEqual([good])
  })
  it('duplicate ids keep one (last wins)', () => {
    const a = createTask({ title: 'first' })
    const r = parseImport(wrap([a, { ...a, title: 'second' }]))
    expect(r.ok && r.tasks).toHaveLength(1)
    expect(r.ok && r.tasks[0].title).toBe('second')
  })
  it('fills defaults and ignores unknown fields', () => {
    const r = parseImport(wrap([{ title: 'min', hacker: '<script>' }]))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.tasks[0]).toMatchObject({ title: 'min', status: 'todo', priority: 'medium', subtasks: [] })
      expect(r.tasks[0]).not.toHaveProperty('hacker')
      expect(r.tasks[0].id).toBeTruthy()
    }
  })
})
