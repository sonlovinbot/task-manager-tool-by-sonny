import { translateAuthError } from './authErrors'
import { supabase } from './supabase'

export type AuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; message: string }

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  message: 'Chưa cấu hình Supabase. Hãy điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong .env.local.',
}

const redirect = () => (typeof window === 'undefined' ? undefined : window.location.origin)

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return NOT_CONFIGURED
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { ok: false, message: translateAuthError(error) } : { ok: true }
  } catch (e) {
    return { ok: false, message: translateAuthError(e) }
  }
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return NOT_CONFIGURED
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirect() },
    })
    if (error) return { ok: false, message: translateAuthError(error) }
    // With email confirmation on, an existing address returns a user with no identities.
    if (data.user && (data.user.identities?.length ?? 1) === 0)
      return { ok: false, message: translateAuthError({ code: 'user_already_exists' }) }
    return { ok: true, needsConfirmation: !data.session }
  } catch (e) {
    return { ok: false, message: translateAuthError(e) }
  }
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  if (!supabase) return NOT_CONFIGURED
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirect() })
    return error ? { ok: false, message: translateAuthError(error) } : { ok: true }
  } catch (e) {
    return { ok: false, message: translateAuthError(e) }
  }
}

export async function updatePassword(password: string): Promise<AuthResult> {
  if (!supabase) return NOT_CONFIGURED
  try {
    const { error } = await supabase.auth.updateUser({ password })
    return error ? { ok: false, message: translateAuthError(error) } : { ok: true }
  } catch (e) {
    return { ok: false, message: translateAuthError(e) }
  }
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut()
}
