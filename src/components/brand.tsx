import { site } from "@/config/site"
import { cn } from "@/lib/utils"

/** "EU" in black italic on brand yellow, like the logo of eucareerserwis.pl. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] text-[13px] font-black tracking-tighter text-[oklch(0.18_0.03_90)] italic",
        "bg-[linear-gradient(160deg,oklch(0.94_0.13_98),oklch(0.865_0.177_90.4)_55%,oklch(0.8_0.17_82))]",
        "shadow-[inset_0_1px_0_oklch(1_0_0/0.65),inset_0_-1px_0_oklch(0.5_0.1_80/0.25),0_1px_2px_oklch(0.4_0.08_80/0.3),0_6px_16px_-6px_oklch(0.78_0.17_86/0.8)]",
        className,
      )}
    >
      <span className="-ml-[0.08em]">EU</span>
    </span>
  )
}

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <BrandMark />
      <span className="grid min-w-0 leading-tight">
        <span className="truncate text-sm font-semibold tracking-tight">{site.name}</span>
        <span className="truncate text-xs text-muted-foreground">{site.product}</span>
      </span>
    </span>
  )
}
