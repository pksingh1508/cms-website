import { PlusIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ButtonLink } from "@/components/button-link"
import { EmptyState } from "@/components/items/empty-state"
import { ItemsGrid } from "@/components/items/items-grid"
import { ItemsTable } from "@/components/items/items-table"
import { ListToolbar } from "@/components/items/list-toolbar"
import { Pagination } from "@/components/items/pagination"
import { PageHeader } from "@/components/shell/page-header"
import { type ContentStatus, getCollection } from "@/config/collections"
import { listItems, PAGE_SIZE } from "@/lib/items"
import { publicEnv } from "@/lib/public-env"
import { serverEnv } from "@/lib/server-env"

export async function generateMetadata({ params }: PageProps<"/[collection]">): Promise<Metadata> {
  const collection = getCollection((await params).collection)
  return { title: collection?.label ?? "Not found" }
}

const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : "")

export default async function ListPage({ params, searchParams }: PageProps<"/[collection]">) {
  const collection = getCollection((await params).collection)
  if (!collection) notFound()

  const sp = await searchParams
  const q = one(sp.q).trim().slice(0, 100)
  const status: ContentStatus | undefined = sp.status === "draft" || sp.status === "published" ? sp.status : undefined
  const page = Math.max(1, Math.floor(Number(one(sp.page)) || 1))

  const { rows, total } = await listItems(collection, { q, status, page })
  const { APP_TIME_ZONE: timeZone } = serverEnv()
  const List = collection.view === "grid" ? ItemsGrid : ItemsTable

  return (
    <>
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: collection.label }]}>
        <ButtonLink href={`/${collection.slug}/new`} size="sm">
          <PlusIcon />
          <span className="hidden sm:inline">New {collection.singular.toLowerCase()}</span>
          <span className="sm:hidden">New</span>
        </ButtonLink>
      </PageHeader>
      <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <collection.icon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold tracking-tight">{collection.label}</h1>
        </div>
        <ListToolbar collection={collection} q={q} status={status} />
        {rows.length === 0 ? (
          <EmptyState collection={collection} filtered={Boolean(q || status || page > 1)} />
        ) : (
          <List collection={collection} rows={rows} timeZone={timeZone} websiteUrl={publicEnv.websiteUrl} />
        )}
        <Pagination slug={collection.slug} page={page} pageSize={PAGE_SIZE} total={total} q={q} status={status} />
      </div>
    </>
  )
}
