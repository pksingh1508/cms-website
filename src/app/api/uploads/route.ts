import { NextResponse } from "next/server"
import { COLLECTION_SLUGS } from "@/config/collections"
import { getCurrentUser } from "@/lib/auth"
import { MEDIA_URL } from "@/lib/media"
import { putObject } from "@/lib/r2"
import { MAX_UPLOAD_BYTES, UPLOAD_TYPES, type UploadType } from "@/lib/uploads"

// Images are resized in the browser first (src/lib/images/prepare.ts), so uploads are small and go
// through this route to R2. No bucket CORS rules or presigned URLs are needed.

const ascii = (bytes: Uint8Array, start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end))

/** The file's first bytes must match its declared type. */
const MAGIC: Record<UploadType, (b: Uint8Array) => boolean> = {
  "image/webp": (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/gif": (b) => ascii(b, 0, 6) === "GIF87a" || ascii(b, 0, 6) === "GIF89a",
}

const fail = (status: number, error: string) => NextResponse.json({ error }, { status })

export async function POST(request: Request) {
  // Same-origin requests only (the session cookie is SameSite=Lax as well)
  const origin = request.headers.get("origin")
  if (!origin || new URL(origin).host !== request.headers.get("host")) return fail(403, "Forbidden")

  const user = await getCurrentUser()
  if (!user?.isAdmin) return fail(401, "Please sign in again.")

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return fail(400, "Invalid upload.")
  }
  const collection = form.get("collection")
  const file = form.get("file")
  if (typeof collection !== "string" || !COLLECTION_SLUGS.includes(collection)) return fail(400, "Invalid upload.")
  if (!(file instanceof File)) return fail(400, "No file received.")
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return fail(413, "The image is too large (4 MB maximum).")

  const type = file.type as UploadType
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!(type in UPLOAD_TYPES) || !MAGIC[type](bytes))
    return fail(415, "Only WebP, JPEG and GIF images can be uploaded.")

  const now = new Date()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  const key = `${collection}/${now.getUTCFullYear()}/${month}/${crypto.randomUUID()}.${UPLOAD_TYPES[type]}`
  try {
    await putObject(key, bytes, type)
  } catch (error) {
    console.error("R2 upload failed", error)
    return fail(502, "The image could not be stored. Please try again.")
  }
  return NextResponse.json({ url: `${MEDIA_URL}/${key}` })
}
