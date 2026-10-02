import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { ButtonLink } from "@/components/button-link"
import { listHref } from "@/components/items/list-href"
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
      <p className="tabular-nums">
        {total === 0 ? (
          "No items"
        ) : (
          <>
            <span className="font-medium text-foreground">
              {first}–{last}
            </span>{" "}
            of {total}
          </>
        )}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <ButtonLink href={listHref(slug, { q, status, page: page - 1 })} variant="outline" size="sm">
              <ChevronLeftIcon />
              <span className="hidden sm:inline">Previous</span>
            </ButtonLink>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeftIcon />
              <span className="hidden sm:inline">Previous</span>
            </Button>
          )}
          <span className="rounded-lg border bg-card px-2.5 py-1 text-xs font-medium text-foreground tabular-nums shadow-sm">
            {page} / {pages}
          </span>
          {page < pages ? (
            <ButtonLink href={listHref(slug, { q, status, page: page + 1 })} variant="outline" size="sm">
              <span className="hidden sm:inline">Next</span>
              <ChevronRightIcon />
            </ButtonLink>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <span className="hidden sm:inline">Next</span>
              <ChevronRightIcon />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
