"use client"

import { ImageIcon } from "lucide-react"
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tool } from "./toolbar"

export function ImageDialog({ onInsert }: { onInsert: (file: File, alt: string) => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState("")

  function openDialog() {
    setFile(null)
    setAlt("")
    setOpen(true)
  }

  return (
    <>
      <Tool icon={ImageIcon} label="Image" onClick={openDialog} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation() // don't submit the item form
              if (!file) return
              onInsert(file, alt.trim())
              setOpen(false)
            }}
            className="grid gap-4"
          >
            <DialogHeader>
              <DialogTitle>Insert image</DialogTitle>
              <DialogDescription>
                The image is resized to 1600 px and uploaded. You can also paste or drop images straight into the text.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="editor-image-file">Image</FieldLabel>
              <Input
                id="editor-image-file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="editor-image-alt">Alt text</FieldLabel>
              <Input
                id="editor-image-alt"
                value={alt}
                maxLength={200}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="What the image shows"
              />
              <FieldDescription>Read aloud by screen readers and used by search engines.</FieldDescription>
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!file}>
                Insert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
