import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars are missing. Favorites and predictions will not persist. ' +
      'Copy .env.example to .env and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = createClient(url ?? '', key ?? '')

/**
 * A stable anonymous identity for devices that haven't signed in.
 * Swap this out for supabase.auth.getUser() once you add real auth —
 * every table below uses `owner_id` as a plain text column so either works.
 */
export function getAnonymousId() {
  const STORAGE_KEY = 'jso_anon_id'
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
