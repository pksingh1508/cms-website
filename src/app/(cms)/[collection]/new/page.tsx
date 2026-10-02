import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ItemEditor } from "@/components/items/item-editor"
import { PageHeader } from "@/components/shell/page-header"
import { getCollection } from "@/config/collections"
import { requireAdmin } from "@/lib/auth"
import { emptyValues } from "@/lib/mapping"
import { publicEnv } from "@/lib/public-env"

export async function generateMetadata({ params }: PageProps<"/[collection]/new">): Promise<Metadata> {
  const collection = getCollection((await params).collection)
  return { title: collection ? `New ${collection.singular.toLowerCase()}` : "Not found" }
}

export default async function NewItemPage({ params }: PageProps<"/[collection]/new">) {
  await requireAdmin()
  const collection = getCollection((await params).collection)
  if (!collection) notFound()

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: collection.label, href: `/${collection.slug}` },
          { label: "New" },
        ]}
      />
      <ItemEditor
        collection={collection.slug}
        item={{ id: null, status: "draft", updatedAt: null, publishedAt: null, values: emptyValues(collection) }}
        websiteUrl={publicEnv.websiteUrl}
      />
    </>
  )
}
