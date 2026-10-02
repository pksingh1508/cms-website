import { cn } from "@/lib/utils"

/**
 * A short light that travels around the border of its (relatively positioned, rounded) parent.
 * The conic gradient is masked down to a 1px ring.
 */
export function BorderBeam({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-px animate-beam rounded-[inherit] p-px",
        "[mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]",
        className,
      )}
      style={{
        background:
          "conic-gradient(from var(--beam-angle), transparent 0%, transparent 62%, oklch(0.865 0.177 90.4) 78%, oklch(0.7 0.16 250) 88%, transparent 96%)",
      }}
    />
  )
}
