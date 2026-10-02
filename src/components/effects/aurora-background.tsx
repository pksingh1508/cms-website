import { PointerGlow } from "@/components/effects/pointer-glow"
import { cn } from "@/lib/utils"

const blob = "absolute rounded-full will-change-transform"

/**
 * Slowly drifting colour fields, a fine grid and film grain. Pure CSS (transforms only),
 * so it stays smooth; the animation stops for people who prefer reduced motion.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("aurora pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}>
      <div
        className={cn(blob, "-top-[35%] -left-[25%] size-[80vmax] animate-aurora-a")}
        style={{ background: "radial-gradient(closest-side, var(--aurora-1), transparent)" }}
      />
      <div
        className={cn(blob, "-top-[20%] -right-[30%] size-[70vmax] animate-aurora-b")}
        style={{ background: "radial-gradient(closest-side, var(--aurora-2), transparent)" }}
      />
      <div
        className={cn(blob, "-bottom-[45%] left-[5%] size-[75vmax] animate-aurora-c")}
        style={{ background: "radial-gradient(closest-side, var(--aurora-3), transparent)" }}
      />
      <div
        className={cn(
          blob,
          "-right-[15%] -bottom-[30%] size-[55vmax] animate-aurora-a [animation-direction:alternate-reverse]",
        )}
        style={{ background: "radial-gradient(closest-side, var(--aurora-4), transparent)" }}
      />
      {/* Grid, faded towards the edges */}
      <div className="absolute inset-0 animate-grid-drift bg-grid mask-radial-from-20% mask-radial-to-75%" />
      {/* Soft light from the top */}
      <div className="absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(55%_75%_at_50%_0%,oklch(1_0_0/0.55),transparent)] dark:bg-[radial-gradient(45%_65%_at_50%_0%,oklch(0.9_0.12_92/0.1),transparent)]" />
      <PointerGlow />
      <div className="grain absolute inset-0 opacity-[0.05] mix-blend-multiply dark:opacity-[0.07] dark:mix-blend-soft-light" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,oklch(0.3_0.03_90/0.07))] dark:bg-[radial-gradient(ellipse_at_center,transparent_35%,oklch(0_0_0/0.55))]" />
    </div>
  )
}
