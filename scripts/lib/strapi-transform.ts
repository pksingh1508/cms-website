// Pure helpers that turn old Strapi values into values for the eu_ tables (unit-tested).

import slugify from "@sindresorhus/slugify"
import { marked } from "marked"

/** Strapi stores UTC timestamps without a time zone: "2026-04-20 13:07:12.259". */
export function strapiDate(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value.replace(" ", "T")}Z`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** "Rakesh- visa-stamp" → "rakesh-visa-stamp"; keeps valid slugs as they are. */
export function importSlug(raw: unknown, fallback: string): string {
  const base = slugify(typeof raw === "string" && raw.trim() ? raw : fallback, { decamelize: false })
  return base.slice(0, 120).replace(/-+$/, "") || "item"
}

/** Makes a slug unique within one import by adding -2, -3, … */
export function uniqueSlug(slug: string, used: Set<string>): string {
  let candidate = slug
  for (let n = 2; used.has(candidate); n++) candidate = `${slug.slice(0, 115)}-${n}`
  used.add(candidate)
  return candidate
}

/**
 * "a, b, c" or "a  b  c" → ["a", "b", "c"] (unique, at most 15, each at most 50 characters).
 * Tags separated only by single spaces can't be split reliably; they come back empty (see tagsNeedReview).
 */
export function splitTags(raw: unknown): string[] {
  if (typeof raw !== "string" || tagsNeedReview(raw)) return []
  const value = raw.trim()
  const parts = value.includes(",") ? value.split(",") : value.split(/\s{2,}/)
  const tags = new Map<string, string>()
  for (const part of parts) {
    const tag = part.trim().replace(/\s+/g, " ").slice(0, 50).trim()
    if (tag && !tags.has(tag.toLowerCase())) tags.set(tag.toLowerCase(), tag)
  }
  return [...tags.values()].slice(0, 15)
}

/** True for a long tag string with no separators, e.g. "Work in Poland Jobs in Poland Legal work in Poland". */
export function tagsNeedReview(raw: unknown): boolean {
  if (typeof raw !== "string") return false
  const value = raw.trim()
  return value.length > 50 && !value.includes(",") && !/\s{2,}/.test(value)
}

/** The three spellings used in Strapi become one. */
export function normalizeAuthor(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null
  return /^eu\s+car+e+r+\s+(serwis|service)s?$/i.test(raw.trim()) ? "EU Career Serwis" : raw.trim()
}

export function clip(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null
  const value = raw.trim()
  if (!value) return null
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Plain text (news) → paragraphs; single line breaks are kept. */
export function textToHtml(raw: unknown): string {
  if (typeof raw !== "string") return ""
  return raw
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

/**
 * Strapi Markdown (blog) → HTML for the new editor.
 * - "•" bullet lines pasted from Word become real lists;
 * - single line breaks are kept;
 * - a top heading that repeats the title is dropped (the website shows the title already),
 *   other top headings become level 2, and levels 5–6 become level 4.
 */
export function markdownToHtml(raw: unknown, title: string): string {
  if (typeof raw !== "string") return ""
  const markdown = separateLists(
    raw
      .replace(/\r\n?/g, "\n")
      .replace(/^[ \t]*[•●▪◦][ \t]*/gm, "- ")
      .trim(),
  )
  let html = marked.parse(markdown, { gfm: true, breaks: true, async: false }) as string
  const first = html.match(/^\s*<h1[^>]*>([\s\S]*?)<\/h1>/)
  if (first && plain(first[1]).toLowerCase() === title.trim().toLowerCase()) html = html.slice(first[0].length)
  return html
    .replace(/<(\/?)h1(\s[^>]*)?>/g, "<$1h2>")
    .replace(/<(\/?)h[56](\s[^>]*)?>/g, "<$1h4>")
    .trim()
}

/** A plain line right after a list item starts a new paragraph instead of continuing the item. */
function separateLists(markdown: string): string {
  const out: string[] = []
  let inList = false
  for (const line of markdown.split("\n")) {
    const isItem = /^\s*(?:[-*+]|\d+[.)])\s+/.test(line)
    const isIndented = /^\s{2,}\S/.test(line)
    if (inList && !isItem && !isIndented && line.trim() !== "") out.push("")
    out.push(line)
    inList = isItem || (inList && (isIndented || line.trim() === ""))
  }
  return out.join("\n")
}

function plain(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
}
