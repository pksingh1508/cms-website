import { ImageIcon } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Thumbnail({ url, className }: { url: unknown; className?: string }) {
  return (
    <span
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground",
        className,
      )}
    >
      {typeof url === "string" && url ? (
        <Image src={url} alt="" fill sizes="44px" className="object-cover" />
      ) : (
        <ImageIcon className="size-4" />
      )}
    </span>
  )
}
