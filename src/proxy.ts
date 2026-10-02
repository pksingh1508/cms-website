import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

// A fast first gate only: pages, data functions and Server Actions check access themselves.
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
