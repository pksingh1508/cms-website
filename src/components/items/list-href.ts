import type { ContentStatus } from "@/config/collections"

/** URL of a list page with its search, status filter and page number. */
export function listHref(slug: string, params: { q?: string; status?: ContentStatus; page?: number }) {
  const search = new URLSearchParams()
  if (params.q) search.set("q", params.q)
  if (params.status) search.set("status", params.status)
  if (params.page && params.page > 1) search.set("page", String(params.page))
  const qs = search.toString()
  return qs ? `/${slug}?${qs}` : `/${slug}`
}
