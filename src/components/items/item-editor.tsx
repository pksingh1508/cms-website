"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { ItemFormProps } from "./item-form"

// The editor relies on browser-only APIs (Tiptap, canvas, the local time zone), so it renders on the client only.
const ItemForm = dynamic(() => import("./item-form").then((m) => m.ItemForm), {
  ssr: false,
  loading: () => <EditorSkeleton />,
})

export function ItemEditor(props: ItemFormProps) {
  return <ItemForm {...props} />
}

function EditorSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
