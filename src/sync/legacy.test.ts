import { DexieTaskRepository } from '../data/DexieTaskRepository'
import { createTask } from '../domain/task'
import { claimLegacyTasks } from './legacy'

let n = 0
const memoryStorage = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }
}

describe('claimLegacyTasks', () => {
  it('copies the old on-device tasks into the first account that signs in', async () => {
    const legacyName = `legacy-${n++}`
    const old = new DexieTaskRepository(legacyName)
    const a = createTask({ title: 'cũ 1' })
    const b = createTask({ title: 'cũ 2' })
    await old.bulkPut([a, b])
    const mine = new DexieTaskRepository(`user-${n++}`)
    const storage = memoryStorage()

    expect(await claimLegacyTasks(mine, 'user-a', storage, legacyName)).toBe(2)
    expect((await mine.list()).map((t) => t.title).sort()).toEqual(['cũ 1', 'cũ 2'])
    expect(storage.getItem('tm-legacy-claimed-by')).toBe('user-a')
    expect((await old.list()).length).toBe(2) // backup left in place
  })

  it('does not hand the same tasks to a second account on this browser', async () => {
    const legacyName = `legacy-${n++}`
    await new DexieTaskRepository(legacyName).put(createTask({ title: 'của người A' }))
    const storage = memoryStorage()
    await claimLegacyTasks(new DexieTaskRepository(`user-${n++}`), 'user-a', storage, legacyName)

    const second = new DexieTaskRepository(`user-${n++}`)
    expect(await claimLegacyTasks(second, 'user-b', storage, legacyName)).toBe(0)
    expect(await second.list()).toEqual([])
  })

  it('does not duplicate or overwrite rows the account already has', async () => {
    const legacyName = `legacy-${n++}`
    const t = createTask({ title: 'bản cũ' })
    await new DexieTaskRepository(legacyName).put(t)
    const mine = new DexieTaskRepository(`user-${n++}`)
    await mine.put({ ...t, title: 'bản mới hơn' })
    expect(await claimLegacyTasks(mine, 'user-a', memoryStorage(), legacyName)).toBe(0)
    expect((await mine.list())[0].title).toBe('bản mới hơn')
  })

  it('marks the claim done even when there is nothing to claim', async () => {
    const storage = memoryStorage()
    expect(await claimLegacyTasks(new DexieTaskRepository(`user-${n++}`), 'user-a', storage, `missing-${n++}`)).toBe(0)
    expect(storage.getItem('tm-legacy-claimed-by')).toBe('user-a')
  })
})
