import Link from "next/link"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

type Props = Omit<ComponentProps<typeof Button>, "render" | "nativeButton"> & {
  href: string
  external?: boolean
}

/** A link that looks like a button. */
export function ButtonLink({ href, external, ...props }: Props) {
  // biome-ignore lint/a11y/useAnchorContent: the button's children become the link text through the render prop
  const anchor = <a href={href} target="_blank" rel="noreferrer" />
  return <Button nativeButton={false} render={external ? anchor : <Link href={href} />} {...props} />
}
