import { describe, expect, it } from "vitest"
import {
  clip,
  importSlug,
  markdownToHtml,
  normalizeAuthor,
  splitTags,
  strapiDate,
  tagsNeedReview,
  textToHtml,
  uniqueSlug,
} from "../scripts/lib/strapi-transform"

describe("Strapi import helpers", () => {
  it("reads Strapi timestamps as UTC", () => {
    expect(strapiDate("2026-04-20 13:07:12.259")).toBe("2026-04-20T13:07:12.259Z")
    expect(strapiDate(null)).toBeNull()
  })

  it("cleans slugs and keeps valid ones", () => {
    expect(importSlug("Rakesh- visa-stamp", "x")).toBe("rakesh-visa-stamp")
    expect(importSlug(" fastest-work-permit-poland", "x")).toBe("fastest-work-permit-poland")
    expect(importSlug("Schengen-Visa", "x")).toBe("schengen-visa")
    expect(importSlug("", "Fallback Title")).toBe("fallback-title")
  })

  it("makes slugs unique", () => {
    const used = new Set(["news"])
    expect(uniqueSlug("news", used)).toBe("news-2")
    expect(uniqueSlug("news", used)).toBe("news-3")
  })

  it("splits tags on commas or double spaces", () => {
    expect(splitTags("Work Visa, Poland ,  , poland")).toEqual(["Work Visa", "Poland"])
    expect(splitTags("Work in Poland  Jobs in Poland  ")).toEqual(["Work in Poland", "Jobs in Poland"])
  })

  it("flags tag strings that can't be split", () => {
    const raw = "Work in Poland Work in Kraków Jobs in Poland Poland work permit Legal work in Poland"
    expect(tagsNeedReview(raw)).toBe(true)
    expect(splitTags(raw)).toEqual([])
    expect(tagsNeedReview("Visa, Poland")).toBe(false)
  })

  it("normalises the author spellings", () => {
    expect(normalizeAuthor("EU CAREER SERVICE")).toBe("EU Career Serwis")
    expect(normalizeAuthor("EU CARRER SERVICE")).toBe("EU Career Serwis")
    expect(normalizeAuthor("Anna Kowalska")).toBe("Anna Kowalska")
  })

  it("clips long text", () => {
    expect(clip("  abcdef ", 4)).toBe("abc…")
    expect(clip("   ", 4)).toBeNull()
  })

  it("turns plain text into escaped paragraphs", () => {
    expect(textToHtml("First line\nsecond <b>line</b>\n\nNext")).toBe(
      "<p>First line<br>second &lt;b&gt;line&lt;/b&gt;</p><p>Next</p>",
    )
  })

  it("converts the blog Markdown", () => {
    const md = "# My Post\n\nIntro\n\n#### Section\nRoles:\n•\tOne\n•\tTwo\nAfter the list\n\n# Another top heading"
    const html = markdownToHtml(md, "My Post")
    expect(html).not.toContain("My Post") // repeated title removed
    expect(html).toContain("<h4>Section</h4>")
    expect(html).toContain("<ul>\n<li>One</li>\n<li>Two</li>\n</ul>")
    expect(html).toContain("<p>After the list</p>")
    expect(html).toContain("<h2>Another top heading</h2>")
  })
})
