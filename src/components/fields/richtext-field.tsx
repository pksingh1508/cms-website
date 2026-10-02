"use client"

import { Controller } from "react-hook-form"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { errorMessage, FieldShell } from "@/components/fields/field-shell"
import { useItem } from "@/components/items/item-context"
import type { FieldConfig } from "@/config/collections"

export function RichTextField({ field }: { field: FieldConfig }) {
  const { collection, beginUpload } = useItem()
  return (
    <Controller
      name={field.name}
      render={({ field: f, fieldState }) => (
        <FieldShell field={field} error={errorMessage(fieldState.error)}>
          <RichTextEditor
            value={typeof f.value === "string" ? f.value : ""}
            onChange={f.onChange}
            onBlur={f.onBlur}
            focusRef={f.ref}
            collection={collection.slug}
            beginUpload={beginUpload}
            invalid={fieldState.invalid}
          />
        </FieldShell>
      )}
    />
  )
}
