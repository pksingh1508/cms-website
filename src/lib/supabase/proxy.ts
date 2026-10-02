import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { publicEnv } from "@/lib/public-env"

/** Refreshes the session cookie on every request and sends guests to /login. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options)
        // no-cache headers, so a CDN never stores a response that sets auth cookies
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value)
      },
    },
  })

  // Don't run code between createServerClient and getClaims(): it verifies and refreshes the session.
  const { data } = await supabase.auth.getClaims()

  const { pathname, search } = request.nextUrl
  const isPublic = pathname === "/login" || pathname.startsWith("/api/")
  if (!data?.claims && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`
    const redirect = NextResponse.redirect(url)
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie) // keep refreshed cookies
    return redirect
  }
  return response
}
