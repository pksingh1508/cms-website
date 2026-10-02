"use client"

import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { errorMessage, FieldShell } from "@/components/fields/field-shell"
import { useItem } from "@/components/items/item-context"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import type { FieldConfig } from "@/config/collections"
import { toSlug } from "@/lib/slug"

/**
 * The page address. For new items it follows the source field (usually the title) until it is edited by hand.
 * Existing items never change their slug automatically, so published links don't break by accident.
 */
export function SlugField({ field }: { field: FieldConfig }) {
  const { collection, isNew, status, savedSlug } = useItem()
  const { setValue } = useFormContext()
  const source = useWatch({ name: field.from ?? "title" })
  const slug = useWatch({ name: field.name })
  const [auto, setAuto] = useState(isNew)

  useEffect(() => {
    if (auto && typeof source === "string") {
      setValue(field.name, toSlug(source), { shouldDirty: true, shouldValidate: false })
    }
  }, [auto, source, field.name, setValue])

  const changedWhilePublished = !isNew && status === "published" && typeof slug === "string" && slug !== savedSlug

  return (
    <Controller
      name={field.name}
      render={({ field: f, fieldState }) => (
        <FieldShell field={field} htmlFor={field.name} error={errorMessage(fieldState.error)}>
          <InputGroup>
            {collection.slugPrefix && (
              <InputGroupAddon>
                <InputGroupText className="pl-1 font-mono text-xs text-muted-foreground/80">
                  {collection.slugPrefix}
                </InputGroupText>
              </InputGroupAddon>
            )}
            <InputGroupInput
              id={field.name}
              ref={f.ref}
              name={f.name}
              value={typeof f.value === "string" ? f.value : ""}
              onChange={(e) => {
                setAuto(false)
                f.onChange(e.target.value)
              }}
              onBlur={() => {
                if (typeof f.value === "string" && f.value) f.onChange(toSlug(f.value))
                f.onBlur()
              }}
              className="font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={fieldState.invalid}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="xs"
                onClick={() => {
                  setAuto(true)
                  if (typeof source === "string") f.onChange(toSlug(source))
                }}
                title="Generate from the title"
              >
                <RefreshCwIcon />
                Generate
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {changedWhilePublished && (
            <p className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-800 animate-in fade-in-0 slide-in-from-top-1 dark:text-amber-200">
              <TriangleAlertIcon className="size-3.5 shrink-0" />
              This page is live. Changing its address breaks links that point to the old one.
            </p>
          )}
        </FieldShell>
      )}
    />
  )
}
