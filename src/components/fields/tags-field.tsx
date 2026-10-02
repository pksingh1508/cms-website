"use client"

import { XIcon } from "lucide-react"
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
        "flex min-h-8 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        invalid && "border-destructive ring-3 ring-destructive/20",
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="rounded text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${tag}`}
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
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
