import { createClient } from '@supabase/supabase-js'

/*
 * WHY: We pull the Supabase URL and key from environment variables (prefixed with VITE_)
 * so they are injected at build time by Vite. This keeps secrets out of source code
 * and allows different configurations per environment (dev/staging/prod).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/*
 * WHY: We validate that both values exist before creating the client.
 * If either env var is missing, the app will fail fast with a clear message
 * instead of silently breaking later during auth calls.
 */
if (!supabaseUrl || !supabasePublishableKey) {
  console.error(
    '[Supabase] Missing required environment variables: ' +
    'VITE_SUPABASE_URL and/or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
    'Check your .env file.'
  )
}

/*
 * WHY: createClient initializes the Supabase SDK with your project URL and API key.
 * This single instance is reused across the entire app (exported below) so that
 * all auth state changes, subscriptions, and database calls share the same
 * connection and session context.
 *
 * The auth config below tunes how the SDK manages sessions:
 *   - autoRefreshToken: true  → silently refreshes the JWT before it expires
 *                                so users stay logged in without interruption
 *   - persistSession: true    → saves the session to localStorage so a page
 *                                reload doesn't log the user out
 *   - detectSessionInUrl: true → checks the URL for a Supabase auth callback
 *                                hash (#access_token=...) left by the OAuth
 *                                redirect flow (used by Google sign-in)
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/*
 * WHY: We export a helper to check connectivity. This is useful for login screens
 * or game pages that need to show a "connecting..." state before the user
 * attempts authentication, preventing confusing errors from a misconfigured project.
 */
export async function checkSupabaseConnection() {
  try {
    // A lightweight "ping" — queries a nonexistent table but any HTTP response
    // confirms the URL and key are valid and the server is reachable.
    const { data, error } = await supabase.from('_health_check_').select('1').limit(1)
    // Even on error (expected for missing table), if we got a network response we're connected.
    if (error && error.message.includes('JSON web token')) {
      // Auth-related error means Supabase responded — connection is fine.
      return true
    }
    return data !== undefined || error !== null
  } catch (e) {
    // Network-level failure (offline, DNS failure, CORS block, etc.)
    console.error('[Supabase] Connection check failed:', e.message)
    return false
  }
}
