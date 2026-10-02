import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div role="status" aria-busy aria-label="Loading">
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <Skeleton className="size-7" />
        <Skeleton className="h-4 w-40 rounded-full" />
      </div>
      <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="size-11 rounded-[13px]" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="hidden h-9 w-80 rounded-xl sm:block" />
        </div>
        <div className="space-y-px overflow-hidden rounded-2xl border bg-card">
          {Array.from({ length: 7 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
            <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
              <Skeleton className="size-11" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3 max-w-md" />
                <Skeleton className="h-3 w-1/3 max-w-xs" />
              </div>
              <Skeleton className="hidden h-6 w-24 rounded-full sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
