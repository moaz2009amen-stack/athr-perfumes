import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

/**
 * Creates a Supabase client with admin privileges using the service role key.
 * WARNING: This client bypasses RLS and should ONLY be used in server-side code
 * (API routes, Server Components, Server Actions).
 * Never expose this client or the service role key to the client.
 */
export async function createAdminSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

/**
 * Type-safe admin client for database operations.
 * Use this for operations that require elevated privileges.
 */
export type AdminClient = Awaited<ReturnType<typeof createAdminSupabaseClient>>

/**
 * Helper to get admin client in API routes.
 * Example:
 * const supabase = await getAdminClient()
 */
export const getAdminClient = createAdminSupabaseClient
