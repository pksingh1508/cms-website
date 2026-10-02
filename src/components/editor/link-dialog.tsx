"use client"

import type { Editor } from "@tiptap/react"
import { LinkIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tool } from "./toolbar"

const normalise = (raw: string) => {
  const url = raw.trim()
  if (!url) return ""
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url
  if (url.includes("@") && !url.includes("/")) return `mailto:${url}`
  return `https://${url.replace(/^\/+/, "")}`
}

export function LinkDialog({ editor, active }: { editor: Editor; active: boolean }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  function openDialog() {
    setUrl((editor.getAttributes("link").href as string | undefined) ?? "")
    setError(null)
    setOpen(true)
  }

  function apply() {
    const href = normalise(url)
    if (!href) return remove()
    if (!/^(https?:\/\/[^\s]+\.[^\s]+|mailto:\S+@\S+|tel:[+\d\s()-]+)$/i.test(href)) {
      setError("Enter a full web address, an email or a phone number.")
      return
    }
    const chain = editor.chain().focus().extendMarkRange("link")
    if (editor.state.selection.empty && !active) {
      chain.insertContent({ type: "text", text: url.trim(), marks: [{ type: "link", attrs: { href } }] }).run()
    } else {
      chain.setLink({ href }).run()
    }
    setOpen(false)
  }

  function remove() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    setOpen(false)
  }

  return (
    <>
      <Tool icon={LinkIcon} label="Link" active={active} onClick={openDialog} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation() // don't submit the item form
              apply()
            }}
            className="grid gap-4"
          >
            <DialogHeader>
              <DialogTitle>{active ? "Edit link" : "Add link"}</DialogTitle>
              <DialogDescription>Links open in a new tab.</DialogDescription>
            </DialogHeader>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="editor-link-url">Web address</FieldLabel>
              <Input
                id="editor-link-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.gov.pl/…"
                autoFocus
                aria-invalid={Boolean(error)}
              />
              <FieldError>{error}</FieldError>
            </Field>
            <DialogFooter>
              {active && (
                <Button type="button" variant="ghost" onClick={remove} className="mr-auto">
                  Remove link
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Apply</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
