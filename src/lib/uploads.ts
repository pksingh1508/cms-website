// Shared by the browser (before uploading) and the upload route (when checking the file).

/** Stays under Vercel's 4.5 MB request-body limit. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

/** What the upload route accepts. Images are converted to WebP or JPEG in the browser; GIFs stay as they are. */
export const UPLOAD_TYPES = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/gif": "gif",
} as const

export type UploadType = keyof typeof UPLOAD_TYPES
