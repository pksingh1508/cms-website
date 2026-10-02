import "server-only"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { publicEnv } from "@/lib/public-env"
import type { Database } from "./database.types"

/** Supabase client for Server Components, Server Actions and Route Handlers (acts as the logged-in user). */
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options)
        } catch {
          // Called from a Server Component: safe to ignore, proxy.ts refreshes sessions.
        }
      },
    },
  })
}
