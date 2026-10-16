import { create } from 'zustand'
import type { SyncStatus } from './types'

export const IDLE_STATUS: SyncStatus = { state: 'idle', pending: 0 }

export const useSyncStatus = create<SyncStatus & { set(s: SyncStatus): void }>((set) => ({
  ...IDLE_STATUS,
  set: (s) => set({ ...s }),
}))
