import { site } from "@/config/site"
import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold tracking-tight text-primary-foreground",
        className,
      )}
    >
      EU
    </span>
  )
}

export function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark />
      <span className="grid leading-tight">
        <span className="truncate text-sm font-semibold">{site.name}</span>
        <span className="truncate text-xs text-muted-foreground">{site.product}</span>
      </span>
    </span>
  )
}
