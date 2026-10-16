import { createTask } from '../../domain/task'
import { FakeRepo } from '../../test/fakeRepo'
import { createTaskStore } from './store'

async function setup(seed = [] as ReturnType<typeof createTask>[]) {
  const repo = new FakeRepo(seed)
  const store = createTaskStore(repo)
  await store.getState().load()
  return { repo, store }
}

describe('task store', () => {
  it('add rejects empty title and leaves state unchanged', async () => {
    const { store, repo } = await setup()
    const res = await store.getState().add({ title: '   ' })
    expect(res).toBeNull()
    expect(store.getState().tasks).toEqual([])
    expect(repo.rows.size).toBe(0)
  })

  it('add persists and shows the task', async () => {
    const { store, repo } = await setup()
    const t = await store.getState().add({ title: 'Việc 1' })
    expect(t?.title).toBe('Việc 1')
    expect(store.getState().tasks).toHaveLength(1)
    expect(repo.rows.size).toBe(1)
  })

  it('cycleStatus updates status and completedAt', async () => {
    const t = createTask({ title: 'a' })
    const { store } = await setup([t])
    await store.getState().cycleStatus(t.id)
    expect(store.getState().tasks[0].status).toBe('doing')
    await store.getState().cycleStatus(t.id)
    expect(store.getState().tasks[0].status).toBe('done')
    expect(store.getState().tasks[0].completedAt).toBeDefined()
    await store.getState().cycleStatus(t.id)
    expect(store.getState().tasks[0].completedAt).toBeUndefined()
  })

  it('update rejects an empty title and keeps the previous one', async () => {
    const t = createTask({ title: 'giữ' })
    const { store } = await setup([t])
    expect(await store.getState().update(t.id, { title: '  ' })).toBe(false)
    expect(store.getState().tasks[0].title).toBe('giữ')
    expect(await store.getState().update(t.id, { title: ' mới ' })).toBe(true)
    expect(store.getState().tasks[0].title).toBe('mới')
  })

  it('remove then undoRemove restores', async () => {
    const t = createTask({ title: 'a' })
    const { store } = await setup([t])
    await store.getState().remove(t.id)
    expect(store.getState().tasks).toHaveLength(0)
    expect(store.getState().lastDeletedId).toBe(t.id)
    await store.getState().undoRemove()
    expect(store.getState().tasks).toHaveLength(1)
    expect(store.getState().lastDeletedId).toBeUndefined()
  })

  it('repo failure sets error and keeps tasks', async () => {
    const t = createTask({ title: 'a' })
    const { store, repo } = await setup([t])
    repo.failing = true
    await store.getState().cycleStatus(t.id)
    expect(store.getState().error).toBeTruthy()
    expect(store.getState().tasks[0].status).toBe('todo')
  })

  it('replaceAll and mergeAll', async () => {
    const a = createTask({ title: 'a' })
    const b = createTask({ title: 'b' })
    const { store } = await setup([a])
    await store.getState().mergeAll([b])
    expect(store.getState().tasks).toHaveLength(2)
    await store.getState().replaceAll([b])
    expect(store.getState().tasks.map((t) => t.title)).toEqual(['b'])
  })
})
