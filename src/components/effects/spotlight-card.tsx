"use client"

import { type ComponentProps, useRef } from "react"
import type { Tone } from "@/config/collections"
import { cn } from "@/lib/utils"

/** Raw colours per tone, for gradients that Tailwind classes can't express. */
export const TONE_COLOR: Record<Tone, string> = {
  blue: "oklch(0.62 0.19 255)",
  violet: "oklch(0.6 0.2 290)",
  amber: "oklch(0.78 0.16 70)",
  rose: "oklch(0.64 0.21 10)",
  emerald: "oklch(0.7 0.15 165)",
  cyan: "oklch(0.72 0.13 215)",
}

/** A card that lifts on hover and lights up under the pointer in its tone's colour. */
export function SpotlightCard({ tone, className, children, style, ...props }: ComponentProps<"div"> & { tone: Tone }) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      onPointerMove={(event) => {
        const element = ref.current
        if (!element || event.pointerType !== "mouse") return
        const rect = element.getBoundingClientRect()
        element.style.setProperty("--spot-x", `${event.clientX - rect.left}px`)
        element.style.setProperty("--spot-y", `${event.clientY - rect.top}px`)
      }}
      style={{ "--tone": TONE_COLOR[tone], ...style } as React.CSSProperties}
      className={cn(
        "group/card relative isolate overflow-hidden rounded-2xl border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-[color-mix(in_oklch,var(--tone)_35%,var(--border))] hover:shadow-md",
        // a thin line of the tone's colour along the top edge
        "before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-(--tone) before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 0%), color-mix(in oklch, var(--tone) 13%, transparent), transparent 65%)",
        }}
      />
      {children}
    </div>
  )
}
