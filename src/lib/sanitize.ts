import sanitizeHtml from "sanitize-html"
import { MEDIA_URL } from "@/lib/media"

// Everything the browser sends is untrusted. Rich text is cleaned against an allowlist before it is
// stored, so the public website can render it as-is.

// The trailing slash also blocks look-alikes such as media.example.com.evil.com or media.example.com@evil.com
const MEDIA_PREFIX = `${MEDIA_URL}/`

export function sanitizeRichText(html: string): string {
  const clean = sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "h4",
      "strong",
      "em",
      "u",
      "s",
      "blockquote",
      "ul",
      "ol",
      "li",
      "hr",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "rel", { name: "target", values: ["_blank"] }],
      img: ["src", "alt", "title", "width", "height"],
      ol: ["start"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      // Runs before attribute filtering, which is why `rel` is allowed above
      a: (tagName, attribs) => {
        if (attribs.target === "_blank") attribs.rel = "noopener noreferrer nofollow"
        else delete attribs.target
        return { tagName, attribs }
      },
    },
    exclusiveFilter: (frame) =>
      frame.tag === "img"
        ? !(frame.attribs.src ?? "").startsWith(MEDIA_PREFIX) // only our own images
        : frame.tag === "a" && !frame.attribs.href
          ? "excludeTag" // unwrap links whose href was removed (e.g. javascript:), keep the text
          : false,
  })
  return clean === "<p></p>" ? "" : clean
}
