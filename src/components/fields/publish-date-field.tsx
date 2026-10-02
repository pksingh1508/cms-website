"use client"

import { Controller } from "react-hook-form"
import { errorMessage } from "@/components/fields/field-shell"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { isoToLocalInput, localInputToIso } from "@/lib/dates"

export function PublishDateField() {
  return (
    <Controller
      name="published_at"
      render={({ field: f, fieldState }) => (
        <Field data-invalid={fieldState.invalid ? true : undefined}>
          <FieldLabel htmlFor="published_at">Publish date</FieldLabel>
          <Input
            id="published_at"
            ref={f.ref}
            type="datetime-local"
            value={isoToLocalInput(typeof f.value === "string" ? f.value : "")}
            onChange={(e) => f.onChange(localInputToIso(e.target.value))}
            onBlur={f.onBlur}
            aria-invalid={fieldState.invalid}
          />
          <FieldDescription>Leave empty to use the moment you publish. A future date schedules it.</FieldDescription>
          <FieldError>{errorMessage(fieldState.error)}</FieldError>
        </Field>
      )}
    />
  )
}
