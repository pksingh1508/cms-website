import { SearchIcon } from "lucide-react"
import Form from "next/form"
import Link from "next/link"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import type { CollectionConfig, ContentStatus } from "@/config/collections"
import { cn } from "@/lib/utils"

const TABS: { label: string; status?: ContentStatus }[] = [
  { label: "All" },
  { label: "Published", status: "published" },
  { label: "Drafts", status: "draft" },
]

export function listHref(slug: string, params: { q?: string; status?: ContentStatus; page?: number }) {
  const search = new URLSearchParams()
  if (params.q) search.set("q", params.q)
  if (params.status) search.set("status", params.status)
  if (params.page && params.page > 1) search.set("page", String(params.page))
  const qs = search.toString()
  return qs ? `/${slug}?${qs}` : `/${slug}`
}

export function ListToolbar({
  collection,
  q,
  status,
}: {
  collection: CollectionConfig
  q: string
  status?: ContentStatus
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Filter by status" className="inline-flex w-fit rounded-lg bg-muted p-1">
        {TABS.map((tab) => {
          const active = tab.status === status
          return (
            <Link
              key={tab.label}
              href={listHref(collection.slug, { q, status: tab.status })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                active && "bg-background text-foreground shadow-sm",
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
      <Form action={`/${collection.slug}`} className="w-full sm:w-72" role="search">
        {status && <input type="hidden" name="status" value={status} />}
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            name="q"
            type="search"
            defaultValue={q}
            placeholder={collection.searchPlaceholder}
            aria-label="Search"
          />
        </InputGroup>
      </Form>
    </div>
  )
}
