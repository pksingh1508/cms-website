import { PlusIcon } from "lucide-react"
import { ButtonLink } from "@/components/button-link"
import type { CollectionConfig } from "@/config/collections"

export function EmptyState({ collection, filtered }: { collection: CollectionConfig; filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <collection.icon className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{filtered ? "Nothing matches" : `No ${collection.label.toLowerCase()} yet`}</p>
        <p className="text-sm text-muted-foreground">
          {filtered ? "Try another search or filter." : `Create the first ${collection.singular.toLowerCase()}.`}
        </p>
      </div>
      {!filtered && (
        <ButtonLink href={`/${collection.slug}/new`} size="sm">
          <PlusIcon />
          New {collection.singular.toLowerCase()}
        </ButtonLink>
      )}
    </div>
  )
}
