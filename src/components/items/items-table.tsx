import Link from "next/link"
import { itemSubtitle, websiteHref } from "@/components/items/item-text"
import { RowActions } from "@/components/items/row-actions"
import { StatusBadge } from "@/components/items/status-badge"
import { Thumbnail } from "@/components/items/thumbnail"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type CollectionConfig, type ContentStatus, hasImage, type Row } from "@/config/collections"
import { formatDate, formatDateTime, timeAgo } from "@/lib/dates"

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
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {withImage && <TableHead className="w-16 pl-4" />}
            <TableHead className={withImage ? "" : "pl-4"}>{collection.singular}</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="hidden w-32 md:table-cell">Published</TableHead>
            <TableHead className="hidden w-32 lg:table-cell">Updated</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const id = String(row.id)
            const title = collection.displayTitle(row)
            const subtitle = itemSubtitle(collection, row)
            return (
              <TableRow key={id}>
                {withImage && (
                  <TableCell className="pl-4">
                    <Thumbnail url={row.image_url} />
                  </TableCell>
                )}
                <TableCell className={withImage ? "max-w-0" : "max-w-0 pl-4"}>
                  <Link href={`/${collection.slug}/${id}`} className="block truncate font-medium hover:underline">
                    {title}
                  </Link>
                  {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} publishedAt={row.published_at} />
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
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
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
