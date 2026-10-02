import slugify from "@sindresorhus/slugify"

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** "Praca w Polsce: Łódź 2026" → "praca-w-polsce-lodz-2026" */
export function toSlug(input: string): string {
  return slugify(input, { decamelize: false }).slice(0, 80).replace(/-+$/, "")
}
