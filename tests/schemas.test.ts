import { describe, expect, it } from "vitest"
import { getCollection } from "@/config/collections"
import { emptyValues } from "@/lib/mapping"
import { buildSchema, fieldErrors } from "@/lib/schemas"

const blog = getCollection("blog")!
const stamps = getCollection("visa-stamps")!
const image = {
  url: "https://media.example.com/blog/2026/10/0b3b6c1e-1f1d-4c39-9e8e-3e2d1f0c9a11.webp",
  alt: "",
  width: 1600,
  height: 900,
}
const draftBlog = { ...emptyValues(blog), title: "Hello", slug: "hello" }

describe("buildSchema", () => {
  it("lets a draft be saved with only the title and slug", () => {
    expect(buildSchema(blog, "draft").safeParse(draftBlog).success).toBe(true)
  })

  it("needs the publish fields before publishing", () => {
    const result = buildSchema(blog, "publish").safeParse(draftBlog)
    expect(result.success).toBe(false)
    expect(Object.keys(fieldErrors(result.error!))).toEqual(expect.arrayContaining(["excerpt", "content", "image"]))
  })

  it("publishes a complete post", () => {
    const values = { ...draftBlog, excerpt: "Short", content: "<p>Body</p>", image }
    expect(buildSchema(blog, "publish").safeParse(values).success).toBe(true)
  })

  it("treats empty rich text as missing", () => {
    const values = { ...draftBlog, excerpt: "Short", content: "<p></p>", image }
    const result = buildSchema(blog, "publish").safeParse(values)
    expect(result.success).toBe(false)
    expect(Object.keys(fieldErrors(result.error!))).toEqual(["content"])
  })

  it("rejects slugs with capitals or spaces", () => {
    expect(buildSchema(blog, "draft").safeParse({ ...draftBlog, slug: "Hello World" }).success).toBe(false)
    expect(buildSchema(blog, "draft").safeParse({ ...draftBlog, slug: "hello--world" }).success).toBe(false)
  })

  it("only accepts images from the media domain", () => {
    const foreign = { ...image, url: "https://evil.example.org/x.webp" }
    expect(buildSchema(blog, "draft").safeParse({ ...draftBlog, image: foreign }).success).toBe(false)
    const lookalike = { ...image, url: "https://media.example.com.evil.org/x.webp" }
    expect(buildSchema(blog, "draft").safeParse({ ...draftBlog, image: lookalike }).success).toBe(false)
  })

  it("turns empty text into null and removes duplicate tags", () => {
    const result = buildSchema(blog, "draft").parse({
      ...draftBlog,
      author_name: "  ",
      tags: ["Visa", "visa", "Poland"],
    })
    expect(result.author_name).toBeNull()
    expect(result.tags).toHaveLength(2)
  })

  it("needs an image even for a visa stamp draft", () => {
    expect(buildSchema(stamps, "draft").safeParse(emptyValues(stamps)).success).toBe(false)
    expect(buildSchema(stamps, "draft").safeParse({ ...emptyValues(stamps), image }).success).toBe(true)
  })

  it("rejects negative counters", () => {
    expect(buildSchema(blog, "draft").safeParse({ ...draftBlog, likes_count: -1 }).success).toBe(false)
  })

  it("normalises the publish date to ISO", () => {
    const result = buildSchema(blog, "draft").parse({ ...draftBlog, published_at: "2026-10-02T10:00:00+02:00" })
    expect(result.published_at).toBe("2026-10-02T08:00:00.000Z")
  })
})
