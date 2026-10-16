import { useAuth } from '../auth/authStore'
import { supabase } from '../auth/supabase'
import { DexieTaskRepository } from '../data/DexieTaskRepository'
import { repoHost, useTaskStore } from '../features/tasks/store'
import { claimLegacyTasks } from './legacy'
import { SignedOutRepository } from './RepoHost'
import { createSyncSession } from './session'
import { SupabaseRemote } from './SupabaseRemote'
import { IDLE_STATUS, useSyncStatus } from './syncStatus'

export const syncSession = createSyncSession({
  host: repoHost,
  // One on-device database per account, so two people on one browser never see each other's tasks.
  makeLocal: (userId) => new DexieTaskRepository(`task-manager-u-${userId}`),
  makeRemote: () => new SupabaseRemote(supabase!),
  claimLegacy: (local, userId) => claimLegacyTasks(local, userId),
  reloadStore: () => useTaskStore.getState().load(),
  resetStore: () =>
    useTaskStore.setState({ tasks: [], loaded: false, error: undefined, lastDeletedId: undefined }),
  setStatus: (s) => useSyncStatus.getState().set(s),
  idleStatus: IDLE_STATUS,
})

/** Start (or stop) syncing whenever the signed-in account changes. Without Supabase the app stays local-only. */
export function bootSync(): void {
  if (!supabase) {
    void useTaskStore.getState().load()
    return
  }
  repoHost.use(new SignedOutRepository())
  const apply = (userId: string | undefined) => void (userId ? syncSession.start(userId) : syncSession.stop())
  useAuth.subscribe((state, prev) => {
    if (state.user?.id !== prev.user?.id) apply(state.user?.id)
  })
  apply(useAuth.getState().user?.id)
}
