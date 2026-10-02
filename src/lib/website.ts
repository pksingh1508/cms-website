import "server-only"
import { serverEnv } from "@/lib/server-env"

/**
 * Tells the public website to refresh its cached pages after published content changed.
 * Optional: does nothing until WEBSITE_REVALIDATE_URL is set. Failures are logged; the website's
 * time-based refresh catches anything missed.
 */
export async function pingWebsite(payload: { collection: string; slug?: string | null }) {
  const { WEBSITE_REVALIDATE_URL: url, WEBSITE_REVALIDATE_SECRET: secret } = serverEnv()
  if (!url) return
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    })
    if (!response.ok) console.error(`Website refresh failed: HTTP ${response.status}`)
  } catch (error) {
    console.error("Website refresh failed", error)
  }
}
