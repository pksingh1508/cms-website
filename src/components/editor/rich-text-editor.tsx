"use client"

import FileHandler from "@tiptap/extension-file-handler"
import Image from "@tiptap/extension-image"
import { Placeholder } from "@tiptap/extensions"
import { type Editor, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { uploadImage } from "@/lib/images/upload"
import { cn } from "@/lib/utils"
import { Toolbar } from "./toolbar"

// FileHandler matches file.type exactly (no wildcards)
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/heic", "image/heif"]
const INLINE_MAX_SIDE = 1600

export type InsertImage = (editor: Editor, file: File, position: number, alt?: string) => Promise<void>

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  focusRef,
  collection,
  beginUpload,
  invalid,
}: {
  value: string
  onChange: (html: string) => void
  onBlur: () => void
  /** Lets the form focus the editor when validation fails. */
  focusRef: (instance: { focus: () => void } | null) => void
  collection: string
  beginUpload: () => () => void
  invalid: boolean
}) {
  // Uploads images (pasted, dropped or chosen in the dialog) to R2, then inserts them. Never as base64.
  const insertImage = useRef<InsertImage>(async () => {})
  insertImage.current = async (editor, file, position, alt = "") => {
    const end = beginUpload()
    const id = toast.loading("Uploading image…")
    try {
      const image = await uploadImage(file, collection, {
        maxSide: INLINE_MAX_SIDE,
        onProgress: (ratio) => toast.loading(`Uploading image… ${Math.round(ratio * 100)}%`, { id }),
      })
      const at = Math.min(position, editor.state.doc.content.size)
      editor
        .chain()
        .focus()
        .insertContentAt(at, {
          type: "image",
          attrs: { src: image.url, alt, width: image.width, height: image.height },
        })
        .run()
      toast.success("Image added", { id })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed. Please try again.", { id })
    } finally {
      end()
    }
  }

  const editor = useEditor({
    immediatelyRender: false, // required with server rendering in Next.js
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, defaultProtocol: "https" },
      }),
      Image, // block images; base64 images are not accepted
      FileHandler.configure({
        allowedMimeTypes: IMAGE_TYPES,
        consumePasteEvent: true, // otherwise pasted HTML may add the same image twice
        onDrop: (editor, files, position) => {
          for (const file of files) void insertImage.current(editor, file, position)
        },
        onPaste: (editor, files) => {
          for (const file of files) void insertImage.current(editor, file, editor.state.selection.anchor)
        },
      }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose prose-neutral max-w-none min-h-80 px-4 py-3 text-[15px] focus:outline-none",
        "aria-label": "Content",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    onBlur: () => onBlur(),
  })

  useEffect(() => {
    focusRef(editor ? { focus: () => editor.commands.focus() } : null)
  }, [editor, focusRef])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        invalid && "border-destructive ring-3 ring-destructive/20",
      )}
    >
      {editor ? (
        <>
          <Toolbar
            editor={editor}
            onInsertImage={(file, alt) => insertImage.current(editor, file, editor.state.selection.anchor, alt)}
          />
          {/* Long articles scroll inside the box, so the toolbar stays in reach */}
          <EditorContent editor={editor} className="max-h-[70vh] overflow-y-auto" />
        </>
      ) : (
        <div className="min-h-[22rem] animate-pulse bg-muted/40" />
      )}
    </div>
  )
}
