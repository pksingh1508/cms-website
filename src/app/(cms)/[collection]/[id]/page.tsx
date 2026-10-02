import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ItemEditor } from "@/components/items/item-editor"
import { PageHeader } from "@/components/shell/page-header"
import { type ContentStatus, getCollection } from "@/config/collections"
import { getItem } from "@/lib/items"
import { rowToValues } from "@/lib/mapping"
import { publicEnv } from "@/lib/public-env"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function generateMetadata({ params }: PageProps<"/[collection]/[id]">): Promise<Metadata> {
  const collection = getCollection((await params).collection)
  return { title: collection ? `Edit ${collection.singular.toLowerCase()}` : "Not found" }
}

export default async function EditItemPage({ params }: PageProps<"/[collection]/[id]">) {
  const { collection: slug, id } = await params
  const collection = getCollection(slug)
  if (!collection || !UUID.test(id)) notFound()

  const row = await getItem(collection, id) // checks admin access
  if (!row) notFound()

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: collection.label, href: `/${collection.slug}` },
          { label: collection.displayTitle(row) },
        ]}
      />
      <ItemEditor
        key={String(row.updated_at)}
        collection={collection.slug}
        item={{
          id: String(row.id),
          status: row.status as ContentStatus,
          updatedAt: String(row.updated_at),
          publishedAt: typeof row.published_at === "string" ? row.published_at : null,
          values: rowToValues(collection, row),
        }}
        websiteUrl={publicEnv.websiteUrl}
      />
    </>
  )
}
