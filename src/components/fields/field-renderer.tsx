"use client"

import { ImageField } from "@/components/fields/image-field"
import { RichTextField } from "@/components/fields/richtext-field"
import { NumberField, TextareaField, TextField } from "@/components/fields/simple-fields"
import { SlugField } from "@/components/fields/slug-field"
import { TagsField } from "@/components/fields/tags-field"
import type { FieldConfig } from "@/config/collections"

/** Picks the input component for a field type. */
export function FieldRenderer({ field }: { field: FieldConfig }) {
  switch (field.type) {
    case "text":
    case "url":
    case "country":
      return <TextField field={field} />
    case "textarea":
      return <TextareaField field={field} />
    case "slug":
      return <SlugField field={field} />
    case "richtext":
      return <RichTextField field={field} />
    case "image":
      return <ImageField field={field} />
    case "tags":
      return <TagsField field={field} />
    case "number":
      return <NumberField field={field} />
  }
}
