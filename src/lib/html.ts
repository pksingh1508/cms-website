/** True when rich-text HTML has no visible text and no images, e.g. "<p></p>". */
export function isBlankHtml(html: string): boolean {
  if (/<img\b/i.test(html)) return false
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s/g, "").length === 0
}

/** Plain text of rich-text HTML, for previews and counters. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/blockquote)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}
