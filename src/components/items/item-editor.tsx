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
      <div className="border-b px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="hidden size-9 rounded-[11px] sm:block" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6 rounded-2xl border bg-card p-5 sm:p-6">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
