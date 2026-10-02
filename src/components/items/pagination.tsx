import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { ButtonLink } from "@/components/button-link"
import { listHref } from "@/components/items/list-toolbar"
import { Button } from "@/components/ui/button"
import type { ContentStatus } from "@/config/collections"

export function Pagination({
  slug,
  page,
  pageSize,
  total,
  q,
  status,
}: {
  slug: string
  page: number
  pageSize: number
  total: number
  q: string
  status?: ContentStatus
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(total, page * pageSize)
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>{total === 0 ? "No items" : `${first}–${last} of ${total}`}</p>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <ButtonLink href={listHref(slug, { q, status, page: page - 1 })} variant="outline" size="sm">
              <ChevronLeftIcon />
              Previous
            </ButtonLink>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeftIcon />
              Previous
            </Button>
          )}
          <span className="tabular-nums">
            {page} / {pages}
          </span>
          {page < pages ? (
            <ButtonLink href={listHref(slug, { q, status, page: page + 1 })} variant="outline" size="sm">
              Next
              <ChevronRightIcon />
            </ButtonLink>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
              <ChevronRightIcon />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
