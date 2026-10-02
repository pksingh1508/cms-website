import type { CollectionConfig, Tone } from "@/config/collections"
import { cn } from "@/lib/utils"

/** Glossy gradient tiles, one colour per content type (full class names, so Tailwind sees them). */
const TILE: Record<Tone, string> = {
  blue: "from-sky-400 to-blue-600 shadow-blue-600/25",
  violet: "from-violet-400 to-indigo-600 shadow-indigo-600/25",
  amber: "from-amber-300 to-orange-500 shadow-orange-500/25",
  rose: "from-pink-400 to-rose-600 shadow-rose-600/25",
  emerald: "from-emerald-400 to-teal-600 shadow-teal-600/25",
  cyan: "from-cyan-400 to-sky-600 shadow-sky-600/25",
}

/** The same colours for text, e.g. an active icon. */
export const TONE_TEXT: Record<Tone, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  violet: "text-violet-600 dark:text-violet-400",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-600 dark:text-rose-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
}

/** A soft glow behind cards, matching the type's colour. */
export const TONE_GLOW: Record<Tone, string> = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  amber: "bg-amber-400",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  cyan: "bg-cyan-500",
}

const SIZE = {
  sm: "size-7 rounded-lg [&>svg]:size-3.5",
  md: "size-9 rounded-[11px] [&>svg]:size-4.5",
  lg: "size-11 rounded-[13px] [&>svg]:size-5",
}

export function CollectionIcon({
  collection,
  size = "md",
  className,
}: {
  collection: Pick<CollectionConfig, "icon" | "tone">
  size?: keyof typeof SIZE
  className?: string
}) {
  const Icon = collection.icon
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center bg-linear-to-br text-white shadow-md ring-1 ring-black/5 ring-inset",
        // a soft top highlight makes the tile look glossy
        "before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-b before:from-white/35 before:to-transparent before:to-60%",
        TILE[collection.tone],
        SIZE[size],
        className,
      )}
    >
      <Icon className="relative drop-shadow-[0_1px_1px_rgb(0_0_0/0.15)]" />
    </span>
  )
}
