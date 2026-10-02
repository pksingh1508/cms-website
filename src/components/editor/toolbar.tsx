"use client"

import { type Editor, useEditorState } from "@tiptap/react"
import {
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  type LucideIcon,
  MinusIcon,
  PilcrowIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ImageDialog } from "./image-dialog"
import { LinkDialog } from "./link-dialog"

export function Toolbar({
  editor,
  onInsertImage,
}: {
  editor: Editor
  onInsertImage: (file: File, alt: string) => void
}) {
  // Tiptap 3 doesn't re-render React on every change; subscribe to just what the toolbar shows
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive("paragraph"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      h4: e.isActive("heading", { level: 4 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })
  const chain = () => editor.chain().focus()

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-1.5 py-1.5"
    >
      <Tool
        icon={PilcrowIcon}
        label="Paragraph"
        active={state.paragraph}
        onClick={() => chain().setParagraph().run()}
      />
      <Tool
        icon={Heading2Icon}
        label="Heading 2"
        active={state.h2}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      />
      <Tool
        icon={Heading3Icon}
        label="Heading 3"
        active={state.h3}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      />
      <Tool
        icon={Heading4Icon}
        label="Heading 4"
        active={state.h4}
        onClick={() => chain().toggleHeading({ level: 4 }).run()}
      />
      <Divider />
      <Tool icon={BoldIcon} label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()} />
      <Tool icon={ItalicIcon} label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()} />
      <Tool
        icon={UnderlineIcon}
        label="Underline"
        active={state.underline}
        onClick={() => chain().toggleUnderline().run()}
      />
      <Tool
        icon={StrikethroughIcon}
        label="Strikethrough"
        active={state.strike}
        onClick={() => chain().toggleStrike().run()}
      />
      <Divider />
      <Tool
        icon={ListIcon}
        label="Bulleted list"
        active={state.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      />
      <Tool
        icon={ListOrderedIcon}
        label="Numbered list"
        active={state.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      />
      <Tool icon={QuoteIcon} label="Quote" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()} />
      <Tool icon={MinusIcon} label="Horizontal line" onClick={() => chain().setHorizontalRule().run()} />
      <Divider />
      <LinkDialog editor={editor} active={state.link} />
      <ImageDialog onInsert={onInsertImage} />
      <Divider />
      <Tool icon={Undo2Icon} label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()} />
      <Tool icon={Redo2Icon} label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()} />
    </div>
  )
}

export function Tool({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor's selection
      onClick={onClick}
      className={cn(
        "size-8 rounded-lg text-muted-foreground hover:text-foreground",
        active &&
          "bg-card text-foreground shadow-sm ring-1 ring-foreground/10 hover:bg-card dark:bg-white/10 dark:hover:bg-white/15",
      )}
    >
      <Icon />
    </Button>
  )
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-foreground/10" />
}
