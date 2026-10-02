import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { CollectionConfig, ContentStatus, ContentTable, Row } from "@/config/collections"
import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export const PAGE_SIZE = 20

/**
 * Supabase client for the generic content layer. The table name is only known at runtime, so rows are
 * plain objects here; Zod validates every write. RLS still applies: this acts as the logged-in admin.
 */
export async function contentDb(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient
}

export type ListParams = { q?: string; status?: ContentStatus; page: number }

export async function listItems(collection: CollectionConfig, params: ListParams) {
  await requireAdmin()
  const supabase = await contentDb()
  const from = (params.page - 1) * PAGE_SIZE

  let query = supabase.from(collection.table).select("*", { count: "exact" })
  if (params.status) query = query.eq("status", params.status)
  const q = params.q?.trim().replace(/[%_\\]/g, "")
  if (q) query = query.ilike(collection.searchField, `%${q}%`)

  const { data, count, error } = await query.order("updated_at", { ascending: false }).range(from, from + PAGE_SIZE - 1) // filters first, then order/range
  if (error?.code === "PGRST103") return { rows: [], total: count ?? 0 } // page past the end
  if (error) throw new Error(`Could not load ${collection.label.toLowerCase()}: ${error.message}`)
  return { rows: (data ?? []) as Row[], total: count ?? 0 }
}

export async function getItem(collection: CollectionConfig, id: string): Promise<Row | null> {
  await requireAdmin()
  const supabase = await contentDb()
  const { data, error } = await supabase.from(collection.table).select("*").eq("id", id).maybeSingle()
  if (error) throw new Error(`Could not load the item: ${error.message}`)
  return (data as Row | null) ?? null
}

export async function countItems(table: ContentTable) {
  await requireAdmin()
  const supabase = await contentDb()
  const head = { count: "exact", head: true } as const
  const [published, drafts] = await Promise.all([
    supabase.from(table).select("id", head).eq("status", "published"),
    supabase.from(table).select("id", head).eq("status", "draft"),
  ])
  return { published: published.count ?? 0, drafts: drafts.count ?? 0 }
}
