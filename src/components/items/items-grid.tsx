import { ImageIcon } from "lucide-react"
import * as motion from "motion/react-client"
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
          <motion.li
            key={id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: Math.min(index, 12) * 0.035 }}
            className="group/tile overflow-hidden rounded-2xl border bg-card shadow-sm transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-md dark:shadow-[inset_0_1px_0_var(--highlight)]"
          >
            <Link href={`/${collection.slug}/${id}`} className="relative block aspect-[5/7] overflow-hidden bg-muted">
              {url ? (
                <Image
                  src={url}
                  alt={typeof row.image_alt === "string" ? row.image_alt : ""}
                  fill
                  loading={index < 4 ? "eager" : "lazy"} // the first row is usually the largest thing on screen
                  sizes="(min-width: 1536px) 16vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover object-top transition-transform duration-700 ease-out-expo group-hover/tile:scale-[1.04]"
                />
              ) : (
                <ImageIcon className="absolute inset-0 m-auto size-6 text-muted-foreground" />
              )}
              <span className="absolute inset-0 bg-linear-to-t from-black/45 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100" />
              <StatusBadge
                status={row.status}
                publishedAt={row.published_at}
                className="absolute top-2.5 left-2.5 bg-background/85 shadow-sm backdrop-blur"
              />
            </Link>
            <div className="flex items-center gap-1 py-2.5 pr-1.5 pl-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/${collection.slug}/${id}`}
                  className="block truncate text-sm font-medium transition-colors hover:text-brand-ink"
                >
                  {title}
                </Link>
                <p className="truncate text-xs text-muted-foreground tabular-nums">
                  {formatDate(row.published_at as string | null, timeZone)}
                </p>
              </div>
              <RowActions
                collection={collection.slug}
                id={id}
                title={title}
                status={row.status as ContentStatus}
                websiteHref={websiteHref(collection, row, websiteUrl)}
              />
            </div>
          </motion.li>
        )
      })}
    </ul>
  )
}
