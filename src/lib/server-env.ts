import "server-only"
import * as z from "zod"

// Server-only settings, validated on first use so a missing value fails with a clear message.
const schema = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_JURISDICTION: z.enum(["", "eu", "fedramp"]).default(""),
  APP_TIME_ZONE: z.string().min(1).default("Europe/Warsaw"),
  WEBSITE_REVALIDATE_URL: z.union([z.literal(""), z.url()]).default(""),
  WEBSITE_REVALIDATE_SECRET: z.string().default(""),
})

let cached: z.infer<typeof schema> | undefined

export function serverEnv() {
  if (!cached) {
    const parsed = schema.safeParse(process.env)
    if (!parsed.success) {
      throw new Error(`Invalid server environment variables:\n${z.prettifyError(parsed.error)}`)
    }
    cached = parsed.data
  }
  return cached
}
