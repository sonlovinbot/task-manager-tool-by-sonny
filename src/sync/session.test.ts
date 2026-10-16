import { DexieTaskRepository } from '../data/DexieTaskRepository'
import { createTask, type Task } from '../domain/task'
import { FakeRemote } from '../test/fakeRemote'
import { RepoHost, SignedOutRepository } from './RepoHost'
import { createSyncSession } from './session'
import { IDLE_STATUS } from './syncStatus'

let n = 0
function build() {
  const host = new RepoHost(new SignedOutRepository())
  const remotes = new Map<string, FakeRemote>()
  const claimed: string[] = []
  const store = { tasks: [] as Task[] }
  const session = createSyncSession({
    host,
    makeLocal: (id) => new DexieTaskRepository(`sess-${n}-${id}`),
    makeRemote: () => {
      const r = new FakeRemote()
      remotes.set(`r${remotes.size}`, r)
      return r
    },
    claimLegacy: async (_l, id) => {
      claimed.push(id)
      return 0
    },
    reloadStore: async () => void (store.tasks = await host.list()),
    resetStore: () => void (store.tasks = []),
    setStatus: () => {},
    idleStatus: IDLE_STATUS,
  })
  return { session, host, store, claimed, remotes }
}

describe('sync session', () => {
  beforeEach(() => void n++)

  it('signed out: shows nothing and refuses writes', async () => {
    const { host } = build()
    expect(await host.list()).toEqual([])
    await expect(host.put(createTask({ title: 'x' }))).rejects.toThrow('NOT_SIGNED_IN')
  })

  it('start: claims legacy data once per account, serves the account data and syncs', async () => {
    const { session, host, store, claimed } = build()
    await session.start('user-a')
    await host.put(createTask({ title: 'của A' }))
    expect(claimed).toEqual(['user-a'])
    expect((await host.list()).map((t) => t.title)).toEqual(['của A'])
    await session.start('user-a') // same account again: no restart
    expect(claimed).toEqual(['user-a'])
    expect(store.tasks).toBeDefined()
  })

  it('switching accounts never shows the previous account tasks', async () => {
    const { session, host, store } = build()
    await session.start('user-a')
    await host.put(createTask({ title: 'bí mật của A' }))
    session.stop()
    expect(await host.list()).toEqual([])
    expect(store.tasks).toEqual([])

    await session.start('user-b')
    expect(await host.list()).toEqual([])
    await session.start('user-a')
    expect((await host.list()).map((t) => t.title)).toEqual(['bí mật của A'])
  })

  it('stop clears the store and refuses further writes', async () => {
    const { session, host } = build()
    await session.start('user-a')
    session.stop()
    await expect(host.put(createTask({ title: 'x' }))).rejects.toThrow('NOT_SIGNED_IN')
    expect(session.userId).toBeNull()
  })
})
