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
  const max = field.maxLength
  const over = max !== undefined && length !== undefined && length > max
  const near = max !== undefined && length !== undefined && !over && length >= max * 0.9
  return (
    <Field data-invalid={error ? true : undefined}>
      <div className="flex items-center justify-between gap-3">
        <FieldLabel htmlFor={htmlFor} className="items-center gap-1.5">
          {field.label}
          {field.required === "always" && (
            <span aria-hidden className="text-destructive">
              *
            </span>
          )}
          {field.required === "publish" && (
            <span className="rounded-full bg-amber-500/10 px-1.5 py-px text-[10.5px] font-medium text-amber-700 ring-1 ring-amber-600/15 ring-inset dark:text-amber-300 dark:ring-amber-400/20">
              Needed to publish
            </span>
          )}
        </FieldLabel>
        {max !== undefined && length !== undefined && (
          <span
            className={cn(
              "text-xs text-muted-foreground tabular-nums transition-colors",
              near && "text-amber-600 dark:text-amber-400",
              over && "font-medium text-destructive",
            )}
          >
            {length}/{max}
          </span>
        )}
      </div>
      {children}
      {field.help && <FieldDescription className="text-xs">{field.help}</FieldDescription>}
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
