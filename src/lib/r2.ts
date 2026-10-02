import "server-only"
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import type { SupabaseClient } from "@supabase/supabase-js"
import { COLLECTIONS, CONTENT_TABLES } from "@/config/collections"
import { cmsKeyFromUrl } from "@/lib/media"
import { serverEnv } from "@/lib/server-env"

let client: S3Client | undefined

function r2() {
  if (!client) {
    const env = serverEnv()
    const jurisdiction = env.R2_JURISDICTION ? `.${env.R2_JURISDICTION}` : ""
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}${jurisdiction}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
      // Only send checksums when an operation requires them (R2 compatibility)
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    })
  }
  return client
}

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await r2().send(
    new PutObjectCommand({
      Bucket: serverEnv().R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable", // keys never change
    }),
  )
}

/** Tables whose rich text can contain images. */
const RICH_TEXT_TABLES = CONTENT_TABLES.filter((table) =>
  COLLECTIONS.some((c) => c.table === table && c.fields.some((f) => f.type === "richtext")),
)

/**
 * Deletes images uploaded by this CMS once no item uses them any more (as main image or inside rich text).
 * Older Strapi files and foreign URLs are left alone. Failures are logged, never thrown.
 */
export async function deleteImagesIfUnused(urls: unknown[], supabase: SupabaseClient) {
  const unique = [...new Set(urls.filter((u): u is string => typeof u === "string" && cmsKeyFromUrl(u) !== null))]
  for (const url of unique) {
    const key = cmsKeyFromUrl(url) as string
    try {
      const head = { count: "exact", head: true } as const
      const usage = await Promise.all([
        ...CONTENT_TABLES.map((table) => supabase.from(table).select("id", head).eq("image_url", url)),
        ...RICH_TEXT_TABLES.map((table) => supabase.from(table).select("id", head).like("content", `%${url}%`)),
      ])
      if (usage.some((r) => r.error || (r.count ?? 0) > 0)) continue
      await r2().send(new DeleteObjectCommand({ Bucket: serverEnv().R2_BUCKET, Key: key }))
    } catch (error) {
      console.error(`Could not delete image ${key}`, error)
    }
  }
}
