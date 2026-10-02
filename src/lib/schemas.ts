import * as z from "zod"
import type { CollectionConfig, FieldConfig } from "@/config/collections"
import { isBlankHtml } from "@/lib/html"
import { isMediaUrl } from "@/lib/media"
import { SLUG_PATTERN } from "@/lib/slug"

// One schema builder, used by the editor in the browser and by the Server Actions.
// Drafts only need the "always" fields; publishing also needs the "publish" fields.

export type SaveMode = "draft" | "publish"

const emptyToNull = (value: string) => (value === "" ? null : value)

export const imageSchema = z.object({
  url: z.string().refine(isMediaUrl, "Upload the image here"),
  alt: z.string().trim().max(200, "At most 200 characters"),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
})

function fieldSchema(field: FieldConfig): z.ZodType {
  const max = field.maxLength ?? 200
  switch (field.type) {
    case "text":
    case "textarea":
    case "country":
      return z.string().trim().max(max, `At most ${max} characters`).transform(emptyToNull)
    case "slug":
      return z
        .string()
        .trim()
        .max(120, "At most 120 characters")
        .refine((v) => v === "" || SLUG_PATTERN.test(v), "Use lowercase letters, numbers and single hyphens")
        .transform(emptyToNull)
    case "richtext":
      return z
        .string()
        .max(500_000, "This text is too long")
        .transform((v) => (isBlankHtml(v) ? "" : v))
    case "url":
      return z
        .string()
        .trim()
        .max(500, "At most 500 characters")
        .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Enter a full link starting with https://")
        .transform(emptyToNull)
    case "tags":
      return z
        .array(z.string().trim().min(1).max(50, "Tags can be at most 50 characters"))
        .max(15, "At most 15 tags")
        .transform((tags) => [...new Map(tags.map((t) => [t.toLowerCase(), t])).values()])
    case "number":
      return z
        .number({ error: "Enter a number" })
        .int("Use a whole number")
        .min(0, "Can't be negative")
        .max(1_000_000_000, "That number is too large")
    case "image":
      return imageSchema.nullable()
  }
}

const hasValue = (v: unknown) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)

export function buildSchema(collection: CollectionConfig, mode: SaveMode) {
  const shape: Record<string, z.ZodType> = {
    published_at: z
      .string()
      .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Enter a valid date")
      .transform((v) => (v === "" ? null : new Date(v).toISOString())),
  }
  for (const field of collection.fields) {
    const needed = field.required === "always" || (field.required === "publish" && mode === "publish")
    const base = fieldSchema(field)
    shape[field.name] = needed ? base.refine(hasValue, field.type === "image" ? "Add an image" : "Required") : base
  }
  return z.object(shape)
}

/** { title: ["Required"], … } for mapping server-side errors back onto the form. */
export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>
}
