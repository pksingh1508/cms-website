import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div>
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <Skeleton className="size-7" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}
