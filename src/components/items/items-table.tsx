import * as motion from "motion/react-client"
import Link from "next/link"
import { itemSubtitle, websiteHref } from "@/components/items/item-text"
import { RowActions } from "@/components/items/row-actions"
import { StatusBadge } from "@/components/items/status-badge"
import { Thumbnail } from "@/components/items/thumbnail"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type CollectionConfig, type ContentStatus, hasImage, type Row } from "@/config/collections"
import { formatDate, formatDateTime, timeAgo } from "@/lib/dates"

const head = "h-10 text-xs font-medium text-muted-foreground"

export function ItemsTable({
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
  const withImage = hasImage(collection)
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm dark:shadow-[inset_0_1px_0_var(--highlight)]">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {withImage && <TableHead className={`${head} w-16 pl-4`} />}
            <TableHead className={withImage ? head : `${head} pl-4`}>{collection.singular}</TableHead>
            <TableHead className={`${head} hidden w-32 sm:table-cell`}>Status</TableHead>
            <TableHead className={`${head} hidden w-32 md:table-cell`}>Published</TableHead>
            <TableHead className={`${head} hidden w-32 lg:table-cell`}>Updated</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const id = String(row.id)
            const title = collection.displayTitle(row)
            const subtitle = itemSubtitle(collection, row)
            return (
              <motion.tr
                key={id}
                data-slot="table-row"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: Math.min(index, 14) * 0.025 }}
                className="group/row border-b transition-colors hover:bg-muted/40 has-aria-expanded:bg-muted/40"
              >
                {withImage && (
                  <TableCell className="py-2.5 pl-4 align-top sm:align-middle">
                    <Thumbnail url={row.image_url} eager={index < 4} />
                  </TableCell>
                )}
                <TableCell
                  className={`max-w-0 whitespace-normal sm:whitespace-nowrap ${withImage ? "py-2.5" : "py-3 pl-4"}`}
                >
                  <Link
                    href={`/${collection.slug}/${id}`}
                    className="line-clamp-2 font-medium transition-colors group-hover/row:text-brand-ink sm:block sm:truncate"
                  >
                    {title}
                  </Link>
                  {subtitle && <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>}
                  {/* Phones: the status sits under the title instead of in its own column */}
                  <StatusBadge status={row.status} publishedAt={row.published_at} className="mt-1.5 sm:hidden" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <StatusBadge status={row.status} publishedAt={row.published_at} />
                </TableCell>
                <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">
                  {formatDate(row.published_at as string | null, timeZone)}
                </TableCell>
                <TableCell
                  className="hidden text-muted-foreground lg:table-cell"
                  title={formatDateTime(row.updated_at as string, timeZone)}
                >
                  {timeAgo(row.updated_at as string)}
                </TableCell>
                <TableCell className="pr-3 text-right">
                  <RowActions
                    collection={collection.slug}
                    id={id}
                    title={title}
                    status={row.status as ContentStatus}
                    websiteHref={websiteHref(collection, row, websiteUrl)}
                  />
                </TableCell>
              </motion.tr>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
