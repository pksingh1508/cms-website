import { Badge } from "@/components/ui/badge"
import { isScheduled } from "@/lib/dates"
import { cn } from "@/lib/utils"

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
      <Badge variant="outline" className={cn("border-amber-300 bg-amber-50 text-amber-800", className)}>
        Scheduled
      </Badge>
    )
  }
  if (status === "published") {
    return (
      <Badge variant="outline" className={cn("border-emerald-300 bg-emerald-50 text-emerald-800", className)}>
        Published
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className={className}>
      Draft
    </Badge>
  )
}
