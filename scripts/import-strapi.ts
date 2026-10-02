// Copies the content of the old Strapi CMS (its tables in this Supabase project) into the eu_ tables.
// It only reads the Strapi tables and never changes them. Images stay where they are in R2.
// Items are matched on legacy_id (the Strapi document id). Importing again replaces imported items with the
// Strapi version, including any changes made to them in the CMS, so it needs --overwrite.
//
//   pnpm import:strapi --dry-run     show what would be imported, write nothing
//   pnpm import:strapi               import (stops if items were imported before)
//   pnpm import:strapi --overwrite   import again, replacing the imported items

import { createClient } from "@supabase/supabase-js"
import { CONTENT_TABLES, type CollectionConfig, getCollection } from "../src/config/collections"
import { COUNTRY_SUGGESTIONS } from "../src/config/countries"
import { rowToValues } from "../src/lib/mapping"
import { sanitizeRichText } from "../src/lib/sanitize"
import { buildSchema } from "../src/lib/schemas"
import {
  clip,
  importSlug,
  markdownToHtml,
  normalizeAuthor,
  splitTags,
  strapiDate,
  tagsNeedReview,
  textToHtml,
  uniqueSlug,
} from "./lib/strapi-transform"

// biome-ignore lint/suspicious/noExplicitAny: rows of the old Strapi tables are untyped
type Row = Record<string, any>

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const secretKey = process.env.SUPABASE_SECRET_KEY
if (!url || !secretKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.")
  process.exit(1)
}
const db = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
const dryRun = process.argv.includes("--dry-run")
const overwrite = process.argv.includes("--overwrite")

async function all(table: string): Promise<Row[]> {
  const rows: Row[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from(table)
      .select("*")
      .order("id")
      .range(from, from + 999)
    if (error) throw new Error(`Reading ${table}: ${error.message}`)
    rows.push(...data)
    if (data.length < 1000) return rows
  }
}

type Doc = { documentId: string; row: Row; published: boolean; createdAt: string; updatedAt: string }

/** Strapi keeps a draft row and a published row per item; take the published one when it exists. */
function documents(rows: Row[]): Doc[] {
  const groups = new Map<string, Row[]>()
  for (const row of rows) groups.set(row.document_id, [...(groups.get(row.document_id) ?? []), row])
  return [...groups.entries()]
    .map(([documentId, versions]) => {
      const published = versions.find((v) => v.published_at)
      const latest = [...versions].sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))[0]
      const created = versions.map((v) => strapiDate(v.created_at)).filter((d): d is string => Boolean(d))
      const updated = versions.map((v) => strapiDate(v.updated_at)).filter((d): d is string => Boolean(d))
      const now = new Date().toISOString()
      return {
        documentId,
        row: published ?? latest,
        published: Boolean(published),
        createdAt: created.sort()[0] ?? now,
        updatedAt: updated.sort().at(-1) ?? now,
      }
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.documentId.localeCompare(b.documentId))
}

const count = (value: unknown) => (Number.isInteger(value) && (value as number) > 0 ? (value as number) : 0)

function standard(doc: Doc) {
  return {
    legacy_id: doc.documentId,
    status: doc.published ? "published" : "draft",
    // Strapi reset its publish date when items were re-published, so the original creation date is used
    published_at: doc.published ? doc.createdAt : null,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
  }
}

/** Number of items that came from an earlier import. */
async function importedCount() {
  const head = { count: "exact", head: true } as const
  const counts = await Promise.all(
    CONTENT_TABLES.map(async (table) => {
      const { count, error } = await db.from(table).select("id", head).not("legacy_id", "is", null)
      if (error || count === null) throw new Error(`Reading ${table}: ${error?.message ?? "no count"}`)
      return count
    }),
  )
  return counts.reduce((sum, n) => sum + n, 0)
}

async function main() {
  if (!dryRun && !overwrite) {
    const existing = await importedCount()
    if (existing > 0) {
      console.error(
        `${existing} items were already imported. Importing again replaces them with the Strapi version, ` +
          "including any changes made to them in the CMS.\nRun with --overwrite if that is what you want.",
      )
      process.exit(1)
    }
  }
  console.log(dryRun ? "Dry run: nothing will be written.\n" : "Importing…\n")

  const [blogs, khabars, stories, testimonials, stamps, permits, files, links, folders, folderLinks] =
    await Promise.all(
      [
        "blogs",
        "khabars",
        "success_stories",
        "testimonials",
        "visa_stamps",
        "work_permits",
        "files",
        "files_related_mph",
        "upload_folders",
        "files_folder_lnk",
      ].map(all),
    )

  const fileById = new Map(files.map((f) => [f.id, f]))
  const folderById = new Map(folders.map((f) => [f.id, f]))
  const folderOfFile = new Map(folderLinks.map((l) => [l.file_id, l.folder_id]))
  const linkFor = new Map<string, Row>()
  for (const link of [...links].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
    const key = `${link.related_type}:${link.related_id}`
    if (!linkFor.has(key)) linkFor.set(key, link)
  }
  const fileFor = (type: string, row: Row) => {
    const link = linkFor.get(`${type}:${row.id}`)
    return link ? fileById.get(link.file_id) : undefined
  }
  const image = (file: Row | undefined, alt: string) =>
    file?.url
      ? {
          image_url: String(file.url),
          image_alt: clip(file.alternative_text, 200) ?? clip(alt, 200),
          image_width: count(file.width) || null,
          image_height: count(file.height) || null,
        }
      : { image_url: null, image_alt: null, image_width: null, image_height: null }

  async function takenSlugs(table: string) {
    const { data, error } = await db.from(table).select("slug").is("legacy_id", null)
    if (error) throw new Error(`Reading ${table}: ${error.message}`)
    return new Set((data ?? []).map((r) => String(r.slug)))
  }

  const reviewTags: string[] = []

  // Blog
  const blogSlugs = await takenSlugs("eu_blog")
  const blogRows = documents(blogs).map((doc) => {
    const r = doc.row
    const title = clip(r.title, 200) ?? "Untitled"
    if (tagsNeedReview(r.tags)) reviewTags.push(`Blog: ${title}`)
    return {
      ...standard(doc),
      title,
      slug: uniqueSlug(importSlug(r.slug, title), blogSlugs),
      excerpt: clip(r.short_desc, 300),
      content: sanitizeRichText(markdownToHtml(r.contents, title)),
      ...image(fileFor("api::blog.blog", r), title),
      author_name: normalizeAuthor(r.author_name),
      tags: splitTags(r.tags),
      likes_count: count(r.likes_count),
      comments_count: count(r.comments_count),
      seo_title: clip(r.meta_title, 200),
      seo_description: clip(r.meta_description, 320),
      seo_keywords: clip(r.meta_keyword, 500),
    }
  })

  // News ("khabar" in Strapi)
  const newsSlugs = await takenSlugs("eu_news")
  const newsRows = documents(khabars).map((doc) => {
    const r = doc.row
    const title = clip(r.title, 200) ?? "Untitled"
    if (tagsNeedReview(r.tags)) reviewTags.push(`News: ${title}`)
    return {
      ...standard(doc),
      title,
      slug: uniqueSlug(importSlug(r.slug, title), newsSlugs),
      excerpt: clip(r.short_desc, 300),
      content: sanitizeRichText(textToHtml(r.contents)),
      ...image(fileFor("api::khabar.khabar", r), title),
      tags: splitTags(r.tags),
      views_count: count(r.views),
    }
  })

  const storyRows = documents(stories).map((doc) => ({
    ...standard(doc),
    name: clip(doc.row.name, 100) ?? "Unnamed",
    story: clip(doc.row.story, 3000),
  }))

  const testimonialRows = documents(testimonials).map((doc) => ({
    ...standard(doc),
    name: clip(doc.row.name, 100) ?? "Unnamed",
    quote: clip(doc.row.what_they_say, 1000),
    views_count: count(doc.row.view_count),
  }))

  const stampRows = documents(stamps)
    .map((doc) => ({ doc, file: fileFor("api::visa-stamp.visa-stamp", doc.row) }))
    .filter(({ file }) => file?.url)
    .map(({ doc, file }) => ({ ...standard(doc), ...image(file, "Visa stamp"), country: null, caption: null }))

  // Work permits: the same image was attached to several items, so keep one item per image.
  // The country comes from the Strapi media folder (Serbia, Slovakia); the main folder holds Polish permits.
  const seenFiles = new Set<number>()
  let duplicatePermits = 0
  const permitRows = documents(permits).flatMap((doc) => {
    const file = fileFor("api::work-permit.work-permit", doc.row)
    if (!file?.url) return []
    if (seenFiles.has(file.id)) {
      duplicatePermits++
      return []
    }
    seenFiles.add(file.id)
    const folder = folderById.get(folderOfFile.get(file.id))
    const country = folder && COUNTRY_SUGGESTIONS.includes(folder.name) ? folder.name : "Poland"
    return [{ ...standard(doc), ...image(file, `Work permit · ${country}`), country, caption: null }]
  })

  const plan: [string, Row[]][] = [
    ["blog", blogRows],
    ["news", newsRows],
    ["success-stories", storyRows],
    ["testimonials", testimonialRows],
    ["visa-stamps", stampRows],
    ["work-permits", permitRows],
  ]

  for (const [slug, rows] of plan) {
    const collection = getCollection(slug) as CollectionConfig
    const published = rows.filter((r) => r.status === "published")
    const incomplete = published.filter(
      (r) => !buildSchema(collection, "publish").safeParse(rowToValues(collection, r)).success,
    )
    console.log(
      `${collection.label.padEnd(16)} ${String(rows.length).padStart(3)} items (${published.length} published, ${rows.length - published.length} drafts)` +
        (incomplete.length ? ` · ${incomplete.length} published items miss required fields` : ""),
    )
    if (dryRun) continue
    for (let i = 0; i < rows.length; i += 100) {
      const { error } = await db.from(collection.table).upsert(rows.slice(i, i + 100), { onConflict: "legacy_id" })
      if (error) throw new Error(`Writing ${collection.table}: ${error.message}`)
    }
  }
  if (duplicatePermits) console.log(`\nSkipped ${duplicatePermits} work permits that repeated another permit's image.`)
  if (reviewTags.length) {
    console.log("\nTags without commas could not be split; add them again in the CMS for:")
    for (const title of reviewTags) console.log(`  - ${title}`)
  }
  console.log(dryRun ? "\nDry run finished." : "\nImport finished.")
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
