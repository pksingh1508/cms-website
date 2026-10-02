import { publicEnv } from "@/lib/public-env"

export const MEDIA_URL = publicEnv.mediaUrl

/** Keys of files uploaded by this CMS: <collection>/<yyyy>/<mm>/<uuid>.<ext> */
export const CMS_KEY_PATTERN =
  /^[a-z-]+\/\d{4}\/\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:webp|jpg|gif)$/

/** True for files served from our media domain (both CMS uploads and the older Strapi files). */
export function isMediaUrl(url: string): boolean {
  return url.startsWith(`${MEDIA_URL}/`) && !url.includes("..")
}

/** The R2 key of a file uploaded by this CMS, or null. Older Strapi files are never deleted by the CMS. */
export function cmsKeyFromUrl(url: string | null | undefined): string | null {
  if (!url || !isMediaUrl(url)) return null
  const key = url.slice(MEDIA_URL.length + 1)
  return CMS_KEY_PATTERN.test(key) ? key : null
}

/** The src of every image in rich-text HTML. */
export function imageUrlsInHtml(html: unknown): string[] {
  if (typeof html !== "string") return []
  return [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)].map((m) => m[1])
}
