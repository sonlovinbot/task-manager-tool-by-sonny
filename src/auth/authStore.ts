import type { User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from './supabase'

interface AuthState {
  user: User | null
  /** True once the stored session has been read, so the UI does not flash the signed-out state. */
  ready: boolean
  /** True while the user arrived from a password-reset email and must choose a new password. */
  recovery: boolean
  init(): () => void
  clearRecovery(): void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: !supabase,
  recovery: false,
  init() {
    if (!supabase) return () => {}
    void supabase.auth.getSession().then(({ data }) => set({ user: data.session?.user ?? null, ready: true }))
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      set({
        user: session?.user ?? null,
        ready: true,
        ...(event === 'PASSWORD_RECOVERY' ? { recovery: true } : {}),
      })
    })
    return () => data.subscription.unsubscribe()
  },
  clearRecovery: () => set({ recovery: false }),
}))
