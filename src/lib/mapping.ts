import type { CollectionConfig, ContentStatus, Row } from "@/config/collections"

// Converts between database rows and editor form values.

export type ImageValue = { url: string; alt: string; width: number | null; height: number | null }
export type FormValues = Record<string, unknown>

const str = (value: unknown) => (typeof value === "string" ? value : "")
const int = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null)

export function emptyValues(collection: CollectionConfig): FormValues {
  return rowToValues(collection, {})
}

export function rowToValues(collection: CollectionConfig, row: Row): FormValues {
  const values: FormValues = { published_at: str(row.published_at) }
  for (const field of collection.fields) {
    const value = row[field.name]
    switch (field.type) {
      case "image": {
        const url = str(row[`${field.name}_url`])
        values[field.name] = url
          ? {
              url,
              alt: str(row[`${field.name}_alt`]),
              width: int(row[`${field.name}_width`]),
              height: int(row[`${field.name}_height`]),
            }
          : null
        break
      }
      case "tags":
        values[field.name] = Array.isArray(value) ? value.filter((t): t is string => typeof t === "string") : []
        break
      case "number":
        values[field.name] = int(value) ?? 0
        break
      default:
        values[field.name] = str(value)
    }
  }
  return values
}

/** Parsed (validated) form values → database columns. Rich text is cleaned with `sanitize`. */
export function valuesToRow(
  collection: CollectionConfig,
  values: FormValues,
  status: ContentStatus,
  sanitize: (html: string) => string,
): Row {
  const row: Row = { status, published_at: values.published_at ?? null }
  for (const field of collection.fields) {
    const value = values[field.name]
    if (field.type === "image") {
      const image = value as ImageValue | null
      row[`${field.name}_url`] = image?.url ?? null
      row[`${field.name}_alt`] = image?.alt ? image.alt : null
      row[`${field.name}_width`] = image?.width ?? null
      row[`${field.name}_height`] = image?.height ?? null
    } else if (field.type === "richtext") {
      row[field.name] = sanitize(typeof value === "string" ? value : "")
    } else {
      row[field.name] = value
    }
  }
  return row
}
