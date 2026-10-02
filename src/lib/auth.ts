import "server-only"
import { redirect } from "next/navigation"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export type CurrentUser = { id: string; email: string; isAdmin: boolean }

/** The logged-in user, checked once per request. Null when nobody is logged in. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims() // verifies the JWT; never trust getSession() on the server
  const claims = data?.claims
  if (!claims?.sub) return null

  const { data: admin } = await supabase.from("eu_admins").select("user_id").eq("user_id", claims.sub).maybeSingle()

  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "", isAdmin: admin !== null }
})

/** Call at the top of every CMS page, data function and Server Action. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user?.isAdmin) redirect("/login") // the login page explains "no access" when relevant
  return user
}
