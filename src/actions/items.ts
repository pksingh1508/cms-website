"use server"

import { after } from "next/server"
import { type CollectionConfig, type ContentStatus, getCollection, type Row } from "@/config/collections"
import type { ActionResult } from "@/lib/action-result"
import { requireAdmin } from "@/lib/auth"
import { contentDb } from "@/lib/items"
import { type FormValues, rowToValues, valuesToRow } from "@/lib/mapping"
import { imageUrlsInHtml } from "@/lib/media"
import { deleteImagesIfUnused } from "@/lib/r2"
import { sanitizeRichText } from "@/lib/sanitize"
import { buildSchema, fieldErrors } from "@/lib/schemas"
import { pingWebsite } from "@/lib/website"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isStatus = (value: unknown): value is ContentStatus => value === "draft" || value === "published"
const slugOf = (row: Row | null | undefined) => (typeof row?.slug === "string" ? row.slug : null)

export type SaveInput = {
  collection: string
  /** null = create */
  id: string | null
  values: FormValues
  /** The button that was pressed: "draft" (Save draft / Unpublish) or "published" (Publish / Save changes). */
  status: ContentStatus
  /** updated_at the editor loaded, so a save never silently overwrites someone else's changes. */
  expectedUpdatedAt: string | null
}

export type SavedItem = {
  id: string
  status: ContentStatus
  updatedAt: string
  publishedAt: string | null
  values: FormValues
}

export async function saveItem(input: SaveInput): Promise<ActionResult<SavedItem>> {
  await requireAdmin()
  const collection = getCollection(input.collection)
  if (!collection || !isStatus(input.status)) return { ok: false, error: "Invalid request." }
  if (input.id !== null && (!UUID.test(input.id) || !input.expectedUpdatedAt)) {
    return { ok: false, error: "Invalid request." }
  }

  const schema = buildSchema(collection, input.status === "published" ? "publish" : "draft")
  const parsed = schema.safeParse(input.values)
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }
  }

  const supabase = await contentDb()
  let previous: Row | null = null
  if (input.id) {
    const { data } = await supabase.from(collection.table).select("*").eq("id", input.id).maybeSingle()
    previous = data as Row | null
    if (!previous) return { ok: false, error: "This item no longer exists." }
  }

  const row = valuesToRow(collection, parsed.data as FormValues, input.status, sanitizeRichText)
  const write = input.id
    ? supabase
        .from(collection.table)
        .update(row)
        .eq("id", input.id)
        .eq("updated_at", input.expectedUpdatedAt as string)
    : supabase.from(collection.table).insert(row)
  const { data, error } = await write.select("*").maybeSingle()

  if (error) return saveError(error)
  if (!data) {
    return {
      ok: false,
      error: "Someone else changed this item after you opened it. Reload the page to see the latest version.",
      code: "conflict",
    }
  }

  const saved = data as Row
  after(async () => {
    if (previous) {
      // Images this item no longer uses: a replaced main image, images removed from the rich text
      const stillUsed = new Set([saved.image_url, ...imageUrlsInHtml(saved.content)])
      const before = [previous.image_url, ...imageUrlsInHtml(previous.content)]
      await deleteImagesIfUnused(
        before.filter((url) => !stillUsed.has(url)),
        supabase,
      )
    }
    if (saved.status === "published" || previous?.status === "published") {
      await pingWebsite({ collection: collection.slug, slug: slugOf(saved) })
    }
  })

  return {
    ok: true,
    data: {
      id: String(saved.id),
      status: saved.status as ContentStatus,
      updatedAt: String(saved.updated_at),
      publishedAt: typeof saved.published_at === "string" ? saved.published_at : null,
      values: rowToValues(collection, saved),
    },
  }
}

/** Publish or unpublish straight from a list. Publishing re-checks the item's required fields. */
export async function setItemStatus(input: {
  collection: string
  id: string
  status: ContentStatus
}): Promise<ActionResult> {
  await requireAdmin()
  const collection = getCollection(input.collection)
  if (!collection || !isStatus(input.status) || !UUID.test(input.id)) return { ok: false, error: "Invalid request." }

  const supabase = await contentDb()
  const { data } = await supabase.from(collection.table).select("*").eq("id", input.id).maybeSingle()
  const row = data as Row | null
  if (!row) return { ok: false, error: "This item no longer exists." }

  if (input.status === "published") {
    const check = buildSchema(collection, "publish").safeParse(rowToValues(collection, row))
    if (!check.success) {
      return { ok: false, error: `Open the item to fill in: ${missingLabels(collection, check.error)}.` }
    }
  }

  const { error } = await supabase.from(collection.table).update({ status: input.status }).eq("id", input.id)
  if (error) return { ok: false, error: "Could not change the status. Please try again." }

  after(() => pingWebsite({ collection: collection.slug, slug: slugOf(row) }))
  return { ok: true, data: undefined }
}

export async function deleteItem(input: { collection: string; id: string }): Promise<ActionResult> {
  await requireAdmin()
  const collection = getCollection(input.collection)
  if (!collection || !UUID.test(input.id)) return { ok: false, error: "Invalid request." }

  const supabase = await contentDb()
  const { data } = await supabase.from(collection.table).select("*").eq("id", input.id).maybeSingle()
  const row = data as Row | null
  if (!row) return { ok: true, data: undefined } // already gone

  const { error } = await supabase.from(collection.table).delete().eq("id", input.id)
  if (error) return { ok: false, error: "Could not delete. Please try again." }

  after(async () => {
    await deleteImagesIfUnused([row.image_url, ...imageUrlsInHtml(row.content)], supabase)
    if (row.status === "published") await pingWebsite({ collection: collection.slug, slug: slugOf(row) })
  })
  return { ok: true, data: undefined }
}

function missingLabels(collection: CollectionConfig, error: Parameters<typeof fieldErrors>[0]) {
  const names = Object.keys(fieldErrors(error))
  return names.map((name) => collection.fields.find((f) => f.name === name)?.label ?? name).join(", ")
}

function saveError(error: { code?: string; message?: string }): ActionResult<never> {
  if (error.code === "23505" && error.message?.includes("slug")) {
    return {
      ok: false,
      error: "This URL slug is already used by another item.",
      fieldErrors: { slug: ["Already used by another item"] },
    }
  }
  if (error.code === "42501") return { ok: false, error: "You don't have permission to do this." }
  if (error.code === "23514")
    return { ok: false, error: "Some values are not allowed. Check the fields and try again." }
  console.error("Save failed", error)
  return { ok: false, error: "Could not save. Please try again." }
}
