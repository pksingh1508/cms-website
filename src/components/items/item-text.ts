import type { CollectionConfig, Row } from "@/config/collections"

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")

/** Second line in lists: the page address for blog/news, otherwise a short preview. */
export function itemSubtitle(collection: CollectionConfig, row: Row): string {
  if (collection.slugPrefix && text(row.slug)) return `${collection.slugPrefix}${text(row.slug)}`
  for (const name of ["quote", "story", "country"]) {
    const value = text(row[name])
    if (value) return value.length > 120 ? `${value.slice(0, 117)}…` : value
  }
  return ""
}

/** Full URL of the item on the public website, or null. */
export function websiteHref(collection: CollectionConfig, row: Row, websiteUrl: string): string | null {
  const path = collection.websitePath?.(row)
  return websiteUrl && path ? `${websiteUrl}${path}` : null
}
