import { describe, expect, it } from "vitest"
import { sanitizeRichText } from "@/lib/sanitize"

const MEDIA = "https://media.example.com/blog/2026/10/0b3b6c1e-1f1d-4c39-9e8e-3e2d1f0c9a11.webp"

describe("sanitizeRichText", () => {
  it("keeps the formatting the editor produces", () => {
    const html =
      "<h2>Title</h2><p><strong>Bold</strong> <em>it</em> <u>u</u> <s>s</s></p><ul><li>One</li></ul><blockquote><p>Q</p></blockquote><hr>"
    expect(sanitizeRichText(html)).toBe(
      "<h2>Title</h2><p><strong>Bold</strong> <em>it</em> <u>u</u> <s>s</s></p><ul><li>One</li></ul><blockquote><p>Q</p></blockquote><hr />",
    )
  })

  it("removes scripts, event handlers and styles", () => {
    const out = sanitizeRichText('<p style="color:red" onclick="x()">Hi<script>alert(1)</script></p>')
    expect(out).toBe("<p>Hi</p>")
    expect(sanitizeRichText('<p>a</p><iframe src="https://evil.example.org"></iframe>')).toBe("<p>a</p>")
  })

  it("unwraps javascript: and protocol-relative links but keeps the text", () => {
    expect(sanitizeRichText('<p><a href="javascript:alert(1)">click</a></p>')).toBe("<p>click</p>")
    expect(sanitizeRichText('<p><a href="java&#x09;script:alert(1)">x</a></p>')).toBe("<p>x</p>")
    expect(sanitizeRichText('<p><a href="javascript&colon;alert(1)">y</a></p>')).toBe("<p>y</p>")
    expect(sanitizeRichText('<p><a href="//evil.example.org">z</a></p>')).toBe("<p>z</p>")
  })

  it("adds rel to links that open in a new tab", () => {
    expect(sanitizeRichText('<a href="https://www.gov.pl" target="_blank">gov</a>')).toBe(
      '<a href="https://www.gov.pl" target="_blank" rel="noopener noreferrer nofollow">gov</a>',
    )
  })

  it("only keeps images from the media domain", () => {
    expect(sanitizeRichText(`<img src="${MEDIA}" alt="ok">`)).toBe(`<img src="${MEDIA}" alt="ok" />`)
    expect(sanitizeRichText('<img src="https://evil.example.org/x.png">')).toBe("")
    expect(sanitizeRichText('<img src="https://media.example.com.evil.org/x.png">')).toBe("")
    expect(sanitizeRichText('<img src="data:image/png;base64,AAAA">')).toBe("")
    expect(sanitizeRichText('<img src="http://media.example.com/x.png">')).toBe("")
  })

  it("drops headings the editor doesn't offer, keeping their text", () => {
    expect(sanitizeRichText("<h1>Big</h1>")).toBe("Big")
  })

  it("returns an empty string for an empty paragraph", () => {
    expect(sanitizeRichText("<p></p>")).toBe("")
  })
})
