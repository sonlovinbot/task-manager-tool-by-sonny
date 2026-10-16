import { DexieTaskRepository } from '../data/DexieTaskRepository'
import { createTask } from '../domain/task'
import { FakeRemote } from '../test/fakeRemote'
import { SyncedTaskRepository } from './SyncedTaskRepository'
import type { SyncStatus } from './types'

let n = 0
function setup(remote = new FakeRemote()) {
  const local = new DexieTaskRepository(`sync-db-${n++}`)
  const statuses: SyncStatus[] = []
  const onPulled = vi.fn()
  const repo = new SyncedTaskRepository(local, remote, (s) => statuses.push(s), onPulled)
  return { local, remote, repo, statuses, onPulled, last: () => statuses[statuses.length - 1] }
}

describe('SyncedTaskRepository', () => {
  it('a created task lands on the device and on the server', async () => {
    const { repo, remote, last } = setup()
    const t = createTask({ title: 'Việc mới' })
    await repo.put(t)
    await repo.idle()
    expect((await repo.list()).map((x) => x.id)).toEqual([t.id])
    expect(remote.rows.get(t.id)?.title).toBe('Việc mới')
    expect(last()).toMatchObject({ state: 'idle', pending: 0 })
  })

  it('when the server rejects the write the task is kept locally, reported as an error and counted as pending', async () => {
    const remote = new FakeRemote()
    remote.failWith = { code: '42501', message: 'new row violates row-level security policy' }
    const { repo, last } = setup(remote)
    const t = createTask({ title: 'Chưa lên được server' })
    await repo.put(t)
    await repo.idle()
    expect((await repo.list())[0].id).toBe(t.id)
    expect(remote.rows.size).toBe(0)
    expect(last().state).toBe('error')
    expect(last().pending).toBe(1)
    expect(last().error).toContain('từ chối ghi')
  })

  it('retries pending changes on the next sync and clears the error', async () => {
    const remote = new FakeRemote()
    remote.failWith = { message: 'TypeError: Failed to fetch' }
    const { repo, last } = setup(remote)
    const t = createTask({ title: 'Offline' })
    await repo.put(t)
    await repo.idle()
    expect(last().error).toContain('Mất kết nối')

    remote.failWith = null
    await repo.sync()
    expect(remote.rows.get(t.id)?.title).toBe('Offline')
    expect(last()).toMatchObject({ state: 'idle', pending: 0, error: undefined })
  })

  it('sync pulls rows that only exist on the server and tells the UI to reload', async () => {
    const cloud = createTask({ title: 'Từ máy khác' })
    const { repo, onPulled } = setup(new FakeRemote([cloud]))
    await repo.sync()
    expect((await repo.list()).map((t) => t.title)).toEqual(['Từ máy khác'])
    expect(onPulled).toHaveBeenCalledTimes(1)
  })

  it('sync pushes rows that only exist on the device (old local data reaches the server)', async () => {
    const { repo, local, remote } = setup()
    const old = createTask({ title: 'Việc tạo trước khi có tài khoản' })
    await local.put(old) // written straight to the device, as legacy data would be
    await repo.sync()
    expect(remote.rows.get(old.id)?.title).toBe('Việc tạo trước khi có tài khoản')
  })

  it('a failed pull is reported and does not touch local data', async () => {
    const remote = new FakeRemote()
    const { repo, local, last } = setup(remote)
    const keep = createTask({ title: 'giữ' })
    await local.put(keep)
    remote.failWith = { code: 'PGRST205' }
    await repo.sync()
    expect(last().error).toContain('Chưa có bảng tasks')
    expect((await local.list()).map((t) => t.title)).toEqual(['giữ'])
  })

  it('remove pushes a tombstone', async () => {
    const { repo, remote } = setup()
    const t = createTask({ title: 'xoá tôi' })
    await repo.put(t)
    await repo.remove(t.id)
    await repo.idle()
    expect(await repo.list()).toEqual([])
    expect(remote.rows.get(t.id)?.deletedAt).toBeDefined()
  })

  it('replaceAll deletes missing tasks on the server and imported rows win over the server copy', async () => {
    const stale = createTask({ title: 'cũ' }, new Date('2026-01-01'))
    const keep = { ...createTask({ title: 'giữ (bản import)' }, new Date('2026-01-01')) }
    const { repo, remote } = setup(new FakeRemote([stale, { ...keep, title: 'giữ (bản server)', updatedAt: '2026-09-01T00:00:00.000Z' }]))
    await repo.sync()
    await repo.replaceAll([keep])
    await repo.idle()
    expect(remote.rows.get(stale.id)?.deletedAt).toBeDefined()
    expect(remote.rows.get(keep.id)?.title).toBe('giữ (bản import)')
    expect((await repo.list()).map((t) => t.title)).toEqual(['giữ (bản import)'])
  })

  it('two quick edits of the same task both reach the server in order', async () => {
    const { repo, remote } = setup()
    const t = createTask({ title: 'v1' })
    await repo.put(t)
    await repo.put({ ...t, title: 'v2' })
    await repo.idle()
    expect(remote.rows.get(t.id)?.title).toBe('v2')
  })
})
