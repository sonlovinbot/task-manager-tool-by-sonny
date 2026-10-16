import { createTask, filterTasks, nextStatus, withStatus } from './task'

const NOW = new Date('2026-10-16T10:00:00.000Z')

describe('createTask', () => {
  it('rejects whitespace-only title', () => {
    expect(() => createTask({ title: '   ' })).toThrow('EMPTY_TITLE')
  })
  it('applies defaults and trims', () => {
    const t = createTask({ title: '  Viết báo cáo ' }, NOW)
    expect(t.title).toBe('Viết báo cáo')
    expect(t.status).toBe('todo')
    expect(t.priority).toBe('medium')
    expect(t.description).toBe('')
    expect(t.subtasks).toEqual([])
    expect(t.createdAt).toBe(NOW.toISOString())
    expect(t.id).toMatch(/[0-9a-f-]{36}/)
  })
})

describe('status', () => {
  it('nextStatus cycles', () => {
    expect(nextStatus('todo')).toBe('doing')
    expect(nextStatus('doing')).toBe('done')
    expect(nextStatus('done')).toBe('todo')
  })
  it('withStatus done sets completedAt and moving back clears it', () => {
    const t = createTask({ title: 'a' }, NOW)
    const done = withStatus(t, 'done', NOW)
    expect(done.completedAt).toBe(NOW.toISOString())
    const back = withStatus(done, 'doing', NOW)
    expect(back.completedAt).toBeUndefined()
  })
})

describe('filterTasks', () => {
  const a = createTask({ title: 'Bán hàng', priority: 'high' })
  const b = { ...createTask({ title: 'Học bài', priority: 'high' }), status: 'doing' as const }
  const c = createTask({ title: 'Dọn nhà', label: 'Cá nhân' })
  it('matches "ban hang" against "Bán hàng"', () => {
    expect(filterTasks([a, b, c], { q: 'ban hang' })).toEqual([a])
  })
  it('combines status+priority', () => {
    expect(filterTasks([a, b, c], { status: 'doing', priority: 'high' })).toEqual([b])
  })
  it('filters by label and matches đ', () => {
    expect(filterTasks([a, b, c], { label: 'Cá nhân' })).toEqual([c])
    expect(filterTasks([a, b, c], { q: 'don nha' })).toEqual([c])
  })
})
