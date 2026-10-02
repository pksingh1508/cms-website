"use client"

import { XIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { Controller } from "react-hook-form"
import { errorMessage, FieldShell } from "@/components/fields/field-shell"
import type { FieldConfig } from "@/config/collections"
import { cn } from "@/lib/utils"

export function TagsField({ field }: { field: FieldConfig }) {
  return (
    <Controller
      name={field.name}
      render={({ field: f, fieldState }) => (
        <FieldShell field={field} htmlFor={field.name} error={errorMessage(fieldState.error)}>
          <TagsInput
            id={field.name}
            value={Array.isArray(f.value) ? (f.value as string[]) : []}
            onChange={f.onChange}
            onBlur={f.onBlur}
            invalid={fieldState.invalid}
          />
        </FieldShell>
      )}
    />
  )
}

function TagsInput({
  id,
  value,
  onChange,
  onBlur,
  invalid,
}: {
  id: string
  value: string[]
  onChange: (tags: string[]) => void
  onBlur: () => void
  invalid: boolean
}) {
  const [draft, setDraft] = useState("")

  function add(raw: string) {
    const next = [...value]
    for (const part of raw.split(",")) {
      const tag = part.trim()
      if (tag && !next.some((t) => t.toLowerCase() === tag.toLowerCase())) next.push(tag)
    }
    if (next.length !== value.length) onChange(next)
    setDraft("")
  }

  return (
    <div
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card px-2 py-1.5 shadow-sm transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 dark:bg-input/30",
        invalid && "border-destructive ring-3 ring-destructive/20",
      )}
    >
      <AnimatePresence initial={false}>
        {value.map((tag) => (
          <motion.span
            key={tag}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="inline-flex items-center gap-1 rounded-full bg-secondary py-0.5 pr-1 pl-2.5 text-xs font-medium ring-1 ring-foreground/[0.06] ring-inset"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
              aria-label={`Remove ${tag}`}
            >
              <XIcon className="size-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        id={id}
        value={draft}
        onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            add(draft)
          } else if (e.key === "Backspace" && !draft && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => {
          add(draft)
          onBlur()
        }}
        placeholder={value.length ? "" : "Type a tag, press Enter"}
        className="min-w-28 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
        aria-invalid={invalid}
      />
    </div>
  )
}
