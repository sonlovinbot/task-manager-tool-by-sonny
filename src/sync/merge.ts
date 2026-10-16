import type { Task } from '../domain/task'

export interface MergePlan {
  /** Rows to write to the device (new or newer on the server). */
  toLocal: Task[]
  /** Rows to send to the server (new or newer on the device). */
  toRemote: Task[]
}

const time = (t: Task) => Date.parse(t.updatedAt) || 0

/** Last-writer-wins by updatedAt. Ties leave both sides alone. Deleted rows travel like any other row. */
export function mergeTasks(local: Task[], remote: Task[]): MergePlan {
  const remoteById = new Map(remote.map((t) => [t.id, t]))
  const localIds = new Set<string>()
  const plan: MergePlan = { toLocal: [], toRemote: [] }

  for (const l of local) {
    localIds.add(l.id)
    const r = remoteById.get(l.id)
    if (!r) plan.toRemote.push(l)
    else if (time(r) > time(l)) plan.toLocal.push(r)
    else if (time(l) > time(r)) plan.toRemote.push(l)
  }
  for (const r of remote) if (!localIds.has(r.id)) plan.toLocal.push(r)
  return plan
}
