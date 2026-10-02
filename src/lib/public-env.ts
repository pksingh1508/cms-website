// Public settings. Next.js inlines NEXT_PUBLIC_* values into the browser bundle at build time,
// so they must be read with literal `process.env.NEXT_PUBLIC_…` expressions.

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`)
  }
  return value
}

const trimSlash = (value: string) => value.replace(/\/+$/, "")

export const publicEnv = {
  supabaseUrl: required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
  supabasePublishableKey: required(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ),
  mediaUrl: trimSlash(required(process.env.NEXT_PUBLIC_MEDIA_URL, "NEXT_PUBLIC_MEDIA_URL")),
  websiteUrl: trimSlash(process.env.NEXT_PUBLIC_WEBSITE_URL ?? ""),
}
