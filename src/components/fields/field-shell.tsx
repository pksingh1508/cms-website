import type { ReactNode } from "react"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import type { FieldConfig } from "@/config/collections"
import { cn } from "@/lib/utils"

/** Label, requirement hint, character counter, help text and error around one input. */
export function FieldShell({
  field,
  htmlFor,
  error,
  length,
  children,
}: {
  field: FieldConfig
  htmlFor?: string
  error?: string
  length?: number
  children: ReactNode
}) {
  const over = field.maxLength !== undefined && length !== undefined && length > field.maxLength
  return (
    <Field data-invalid={error ? true : undefined}>
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel htmlFor={htmlFor}>
          {field.label}
          {field.required === "always" && (
            <span aria-hidden className="text-destructive">
              *
            </span>
          )}
          {field.required === "publish" && (
            <span className="text-xs font-normal text-muted-foreground">· needed to publish</span>
          )}
        </FieldLabel>
        {field.maxLength !== undefined && length !== undefined && (
          <span className={cn("text-xs tabular-nums text-muted-foreground", over && "font-medium text-destructive")}>
            {length}/{field.maxLength}
          </span>
        )}
      </div>
      {children}
      {field.help && <FieldDescription>{field.help}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

/** First message of a field error, including nested ones (e.g. image.alt). */
export function errorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined
  const e = error as { message?: unknown } & Record<string, unknown>
  if (typeof e.message === "string" && e.message) return e.message
  for (const value of Object.values(e)) {
    const nested = errorMessage(value)
    if (nested) return nested
  }
  return undefined
}
