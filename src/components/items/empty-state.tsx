import { PlusIcon, SearchXIcon } from "lucide-react"
import { ButtonLink } from "@/components/button-link"
import { CollectionIcon } from "@/components/collection-icon"
import type { CollectionConfig } from "@/config/collections"

export function EmptyState({ collection, filtered }: { collection: CollectionConfig; filtered: boolean }) {
  return (
    <div className="relative isolate flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-dashed bg-card/60 px-6 py-20 text-center animate-in fade-in-0 zoom-in-[0.98] duration-500">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-radial-from-0% mask-radial-to-60%" />
      {filtered ? (
        <span className="flex size-12 animate-float items-center justify-center rounded-2xl border bg-card text-muted-foreground shadow-sm">
          <SearchXIcon className="size-5" />
        </span>
      ) : (
        <CollectionIcon collection={collection} size="lg" className="animate-float" />
      )}
      <div className="space-y-1">
        <p className="font-semibold tracking-tight">
          {filtered ? "Nothing matches" : `No ${collection.label.toLowerCase()} yet`}
        </p>
        <p className="text-sm text-muted-foreground">
          {filtered ? "Try another search or filter." : `Create the first ${collection.singular.toLowerCase()}.`}
        </p>
      </div>
      {!filtered && (
        <ButtonLink href={`/${collection.slug}/new`}>
          <PlusIcon />
          New {collection.singular.toLowerCase()}
        </ButtonLink>
      )}
    </div>
  )
}
