import { ImageIcon } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Thumbnail({ url, eager, className }: { url: unknown; eager?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground ring-1 ring-foreground/[0.07] ring-inset",
        className,
      )}
    >
      {typeof url === "string" && url ? (
        <Image
          src={url}
          alt=""
          fill
          sizes="44px"
          loading={eager ? "eager" : "lazy"} // the first thumbnails are often the largest image on a phone
          className="object-cover transition-transform duration-500 ease-out-expo group-hover/row:scale-110"
        />
      ) : (
        <ImageIcon className="size-4" />
      )}
    </span>
  )
}
