import { describe, expect, it } from "vitest"
import { getCollection } from "@/config/collections"
import { isScheduled, localInputToIso, timeAgo } from "@/lib/dates"
import { isBlankHtml } from "@/lib/html"
import { rowToValues, valuesToRow } from "@/lib/mapping"
import { cmsKeyFromUrl, isMediaUrl } from "@/lib/media"
import { SLUG_PATTERN, toSlug } from "@/lib/slug"

describe("slugs", () => {
  it("transliterates and joins words with hyphens", () => {
    expect(toSlug("Praca w Polsce: Łódź 2026")).toBe("praca-w-polsce-lodz-2026")
    expect(toSlug("  Work Visa — Germany & Austria! ")).toBe("work-visa-germany-and-austria")
  })

  it("produces values the database accepts", () => {
    for (const title of ["Ąę ĆŁ", "A/B testing?", "2026: what's new"])
      expect(SLUG_PATTERN.test(toSlug(title))).toBe(true)
  })
})

describe("media URLs", () => {
  const key = "blog/2026/10/0b3b6c1e-1f1d-4c39-9e8e-3e2d1f0c9a11.webp"

  it("recognises files uploaded by the CMS", () => {
    expect(cmsKeyFromUrl(`https://media.example.com/${key}`)).toBe(key)
  })

  it("never treats old Strapi files or other sites as deletable", () => {
    expect(isMediaUrl("https://media.example.com/uploads/permit_1a2b.jpg")).toBe(true)
    expect(cmsKeyFromUrl("https://media.example.com/uploads/permit_1a2b.jpg")).toBeNull()
    expect(cmsKeyFromUrl(`https://elsewhere.example.org/${key}`)).toBeNull()
    expect(cmsKeyFromUrl(`https://media.example.com/../${key}`)).toBeNull()
  })
})

describe("row ⇄ form values", () => {
  const blog = getCollection("blog")!

  it("maps the image columns to one image value and back", () => {
    const row = {
      title: "T",
      slug: "t",
      image_url: "https://media.example.com/x.webp",
      image_alt: null,
      image_width: 800,
      image_height: 600,
      tags: ["a"],
      likes_count: 5,
      published_at: null,
    }
    const values = rowToValues(blog, row)
    expect(values.image).toEqual({ url: row.image_url, alt: "", width: 800, height: 600 })
    expect(values.excerpt).toBe("")
    expect(values.comments_count).toBe(0)

    const back = valuesToRow(blog, { ...values, content: "<p>x</p>" }, "draft", (html) => `[${html}]`)
    expect(back).toMatchObject({ status: "draft", image_url: row.image_url, image_alt: null, image_width: 800 })
    expect(back.content).toBe("[<p>x</p>]")
  })
})

describe("dates and HTML helpers", () => {
  it("detects scheduled items", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString()
    expect(isScheduled("published", future)).toBe(true)
    expect(isScheduled("draft", future)).toBe(false)
    expect(isScheduled("published", new Date(0).toISOString())).toBe(false)
  })

  it("formats relative times", () => {
    const now = Date.parse("2026-10-02T12:00:00Z")
    expect(timeAgo("2026-10-02T09:00:00Z", now)).toBe("3 hours ago")
    expect(timeAgo("2026-10-02T11:59:50Z", now)).toBe("just now")
  })

  it("converts empty date inputs to an empty string", () => {
    expect(localInputToIso("")).toBe("")
  })

  it("knows when rich text is blank", () => {
    expect(isBlankHtml("<p></p>")).toBe(true)
    expect(isBlankHtml("<p> &nbsp; </p>")).toBe(true)
    expect(isBlankHtml('<p></p><img src="x">')).toBe(false)
  })
})

describe("images inside rich text", () => {
  it("finds every image source", async () => {
    const { imageUrlsInHtml } = await import("@/lib/media")
    const html =
      '<p>a</p><img src="https://media.example.com/a.webp" alt=""><p><img alt="x" src="https://media.example.com/b.webp" /></p>'
    expect(imageUrlsInHtml(html)).toEqual(["https://media.example.com/a.webp", "https://media.example.com/b.webp"])
    expect(imageUrlsInHtml(null)).toEqual([])
  })
})
