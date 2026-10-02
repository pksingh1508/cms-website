"use client"

import { EllipsisIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon, PencilIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteItem, setItemStatus } from "@/actions/items"
import { DeleteDialog } from "@/components/items/delete-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ContentStatus } from "@/config/collections"

export function RowActions({
  collection,
  id,
  title,
  status,
  websiteHref,
}: {
  collection: string
  id: string
  title: string
  status: ContentStatus
  websiteHref: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function changeStatus(next: ContentStatus) {
    startTransition(async () => {
      const result = await setItemStatus({ collection, id, status: next })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(next === "published" ? "Published" : "Unpublished — it's now a draft")
      router.refresh()
    })
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteItem({ collection, id })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setConfirmOpen(false)
      toast.success("Deleted")
      router.refresh()
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${title}`} disabled={pending} />}
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem render={<Link href={`/${collection}/${id}`} />}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
          {status === "published" ? (
            <DropdownMenuItem onClick={() => changeStatus("draft")}>
              <EyeOffIcon />
              Unpublish
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => changeStatus("published")}>
              <EyeIcon />
              Publish
            </DropdownMenuItem>
          )}
          {websiteHref && status === "published" && (
            <DropdownMenuItem render={<a href={websiteHref} target="_blank" rel="noreferrer" />}>
              <ExternalLinkIcon />
              View on website
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={title}
        pending={pending}
        onConfirm={remove}
      />
    </>
  )
}
