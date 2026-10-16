import { createTask } from '../domain/task'
import { DexieTaskRepository } from './DexieTaskRepository'

let n = 0
const repo = () => new DexieTaskRepository(`test-db-${n++}`)

describe('DexieTaskRepository', () => {
  it('put then list returns task', async () => {
    const r = repo()
    const t = createTask({ title: 'a' })
    await r.put(t)
    expect(await r.list()).toEqual([t])
    expect(await r.get(t.id)).toEqual(t)
  })

  it('remove hides from list and restore brings it back', async () => {
    const r = repo()
    const t = createTask({ title: 'a' })
    await r.put(t)
    await r.remove(t.id)
    expect(await r.list()).toEqual([])
    await r.restore(t.id)
    expect((await r.list())[0].id).toBe(t.id)
    expect((await r.list())[0].deletedAt).toBeUndefined()
  })

  it('bulkPut upserts by id (no duplicates)', async () => {
    const r = repo()
    const t = createTask({ title: 'a' })
    await r.bulkPut([t])
    await r.bulkPut([{ ...t, title: 'b' }])
    const list = await r.list()
    expect(list).toHaveLength(1)
    expect(list[0].title).toBe('b')
  })

  it('list returns newest createdAt first', async () => {
    const r = repo()
    const old = createTask({ title: 'old' }, new Date('2026-01-01'))
    const recent = createTask({ title: 'new' }, new Date('2026-02-01'))
    await r.bulkPut([old, recent])
    expect((await r.list()).map((t) => t.title)).toEqual(['new', 'old'])
  })

  it('clear removes everything', async () => {
    const r = repo()
    await r.put(createTask({ title: 'a' }))
    await r.clear()
    expect(await r.list()).toEqual([])
  })
})

describe('DexieTaskRepository.replaceAll', () => {
  it('replaces all rows', async () => {
    const r = repo()
    await r.put(createTask({ title: 'old' }))
    await r.replaceAll([createTask({ title: 'new' })])
    expect((await r.list()).map((t) => t.title)).toEqual(['new'])
  })

  it('is atomic: a failing write leaves existing data untouched', async () => {
    const r = repo()
    const keep = createTask({ title: 'keep' })
    await r.put(keep)
    const bad = { ...createTask({ title: 'bad' }), id: undefined } as never
    await expect(r.replaceAll([bad])).rejects.toBeDefined()
    expect((await r.list()).map((t) => t.title)).toEqual(['keep'])
  })
})
