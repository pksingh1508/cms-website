"use client"

import { Controller } from "react-hook-form"
import { errorMessage, FieldShell } from "@/components/fields/field-shell"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { FieldConfig } from "@/config/collections"
import { COUNTRY_SUGGESTIONS } from "@/config/countries"

const asText = (value: unknown) => (typeof value === "string" ? value : "")

export function TextField({ field }: { field: FieldConfig }) {
  const inputType = field.type === "url" ? "url" : "text"
  return (
    <Controller
      name={field.name}
      render={({ field: f, fieldState }) => (
        <FieldShell
          field={field}
          htmlFor={field.name}
          error={errorMessage(fieldState.error)}
          length={field.type === "url" ? undefined : asText(f.value).length}
        >
          <Input
            id={field.name}
            ref={f.ref}
            name={f.name}
            type={inputType}
            inputMode={field.type === "url" ? "url" : undefined}
            value={asText(f.value)}
            onChange={f.onChange}
            onBlur={f.onBlur}
            placeholder={field.placeholder}
            list={field.type === "country" ? COUNTRY_LIST_ID : undefined}
            autoComplete="off"
            aria-invalid={fieldState.invalid}
          />
        </FieldShell>
      )}
    />
  )
}

export function TextareaField({ field }: { field: FieldConfig }) {
  return (
    <Controller
      name={field.name}
      render={({ field: f, fieldState }) => (
        <FieldShell
          field={field}
          htmlFor={field.name}
          error={errorMessage(fieldState.error)}
          length={asText(f.value).length}
        >
          <Textarea
            id={field.name}
            ref={f.ref}
            name={f.name}
            rows={field.rows ?? 4}
            value={asText(f.value)}
            onChange={f.onChange}
            onBlur={f.onBlur}
            placeholder={field.placeholder}
            aria-invalid={fieldState.invalid}
          />
        </FieldShell>
      )}
    />
  )
}

export function NumberField({ field }: { field: FieldConfig }) {
  return (
    <Controller
      name={field.name}
      render={({ field: f, fieldState }) => (
        <FieldShell field={field} htmlFor={field.name} error={errorMessage(fieldState.error)}>
          <Input
            id={field.name}
            ref={f.ref}
            name={f.name}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="0"
            value={typeof f.value === "number" && f.value !== 0 ? String(f.value) : ""}
            onChange={(e) => f.onChange(e.target.value === "" ? 0 : e.target.valueAsNumber)}
            onBlur={f.onBlur}
            aria-invalid={fieldState.invalid}
          />
        </FieldShell>
      )}
    />
  )
}

export const COUNTRY_LIST_ID = "country-suggestions"

/** Rendered once by the editor; country inputs point at it with list="country-suggestions". */
export function CountrySuggestions() {
  return (
    <datalist id={COUNTRY_LIST_ID}>
      {COUNTRY_SUGGESTIONS.map((country) => (
        <option key={country} value={country} />
      ))}
    </datalist>
  )
}
