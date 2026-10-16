import Dexie from 'dexie'
import { DexieTaskRepository } from '../data/DexieTaskRepository'
import type { LocalTaskRepository } from './types'

export const LEGACY_DB = 'task-manager'
const CLAIM_KEY = 'tm-legacy-claimed-by'

/**
 * Before accounts existed, tasks lived in a single shared on-device database. The first account that
 * signs in on this browser takes those tasks over (they then reach the server through the normal sync).
 * The old database is left untouched as a backup, and it is claimed only once so a second account
 * on the same browser never receives the first person's tasks.
 */
export async function claimLegacyTasks(
  target: LocalTaskRepository,
  userId: string,
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
  legacyName: string = LEGACY_DB,
): Promise<number> {
  if (storage.getItem(CLAIM_KEY)) return 0
  let claimed = 0
  if (await Dexie.exists(legacyName)) {
    const legacy = await new DexieTaskRepository(legacyName).listAll()
    const existing = new Set((await target.listAll()).map((t) => t.id))
    const fresh = legacy.filter((t) => !existing.has(t.id))
    if (fresh.length > 0) await target.bulkPut(fresh)
    claimed = fresh.length
  }
  storage.setItem(CLAIM_KEY, userId)
  return claimed
}
