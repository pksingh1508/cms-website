import { Clock3Icon } from "lucide-react"
import { isScheduled } from "@/lib/dates"
import { cn } from "@/lib/utils"

const base =
  "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset"

/** Draft / Published / Scheduled (published with a future date). */
export function StatusBadge({
  status,
  publishedAt,
  className,
}: {
  status: unknown
  publishedAt: unknown
  className?: string
}) {
  if (isScheduled(status, publishedAt)) {
    return (
      <span
        className={cn(
          base,
          "bg-sky-500/10 text-sky-700 ring-sky-600/20 dark:text-sky-300 dark:ring-sky-400/25",
          className,
        )}
      >
        <Clock3Icon className="size-3" />
        Scheduled
      </span>
    )
  }
  if (status === "published") {
    return (
      <span
        className={cn(
          base,
          "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-300 dark:ring-emerald-400/25",
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_oklch(0.7_0.15_160/0.2)]" />
        Published
      </span>
    )
  }
  return (
    <span className={cn(base, "bg-muted text-muted-foreground ring-foreground/10", className)}>
      <span className="size-1.5 rounded-full bg-muted-foreground/50" />
      Draft
    </span>
  )
}
