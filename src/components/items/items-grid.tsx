import { ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { websiteHref } from "@/components/items/item-text"
import { RowActions } from "@/components/items/row-actions"
import { StatusBadge } from "@/components/items/status-badge"
import type { CollectionConfig, ContentStatus, Row } from "@/config/collections"
import { formatDate } from "@/lib/dates"

/** Card grid for image-first content (visa stamps, work permits). */
export function ItemsGrid({
  collection,
  rows,
  timeZone,
  websiteUrl,
}: {
  collection: CollectionConfig
  rows: Row[]
  timeZone: string
  websiteUrl: string
}) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
      {rows.map((row, index) => {
        const id = String(row.id)
        const title = collection.displayTitle(row)
        const url = typeof row.image_url === "string" ? row.image_url : ""
        return (
          <li key={id} className="overflow-hidden rounded-xl border bg-card">
            <Link href={`/${collection.slug}/${id}`} className="relative block aspect-[5/7] bg-muted">
              {url ? (
                <Image
                  src={url}
                  alt={typeof row.image_alt === "string" ? row.image_alt : ""}
                  fill
                  loading={index < 4 ? "eager" : "lazy"} // the first row is usually the largest thing on screen
                  sizes="(min-width: 1536px) 16vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover object-top"
                />
              ) : (
                <ImageIcon className="absolute inset-0 m-auto size-6 text-muted-foreground" />
              )}
            </Link>
            <div className="flex items-start gap-1 p-2.5">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Link href={`/${collection.slug}/${id}`} className="block truncate text-sm font-medium hover:underline">
                  {title}
                </Link>
                <div className="flex items-center gap-2">
                  <StatusBadge status={row.status} publishedAt={row.published_at} />
                  <span className="truncate text-xs text-muted-foreground">
                    {formatDate(row.published_at as string | null, timeZone)}
                  </span>
                </div>
              </div>
              <RowActions
                collection={collection.slug}
                id={id}
                title={title}
                status={row.status as ContentStatus}
                websiteHref={websiteHref(collection, row, websiteUrl)}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
