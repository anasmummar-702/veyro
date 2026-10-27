import "server-only"
import { cookies } from "next/headers"
import { connection } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, assertSupabaseEnv } from "@/lib/env"

/**
 * Supabase client bound to the current request's cookies.
 * Reading cookies makes every caller request-time (never prerendered), which is
 * what we want: all learner data is per-user and protected by RLS.
 */
export async function createClient() {
  assertSupabaseEnv()
  const cookieStore = await cookies()
  // The auth client reads the clock (token expiry) as it starts up. Marking the
  // render as request-time keeps Next from trying to prerender/prefetch it.
  await connection()

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy refreshes sessions, so this is safe to ignore.
        }
      },
    },
  })
}
