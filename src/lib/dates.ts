const formatters = new Map<string, Intl.DateTimeFormat>()

function formatter(timeZone: string, withTime: boolean) {
  const key = `${timeZone}|${withTime}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat(
      "en-GB",
      withTime ? { dateStyle: "medium", timeStyle: "short", timeZone } : { dateStyle: "medium", timeZone },
    )
    formatters.set(key, f)
  }
  return f
}

function toDate(iso: string | null | undefined) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "2 Oct 2026" in the given time zone. */
export function formatDate(iso: string | null | undefined, timeZone: string): string {
  const d = toDate(iso)
  return d ? formatter(timeZone, false).format(d) : "—"
}

/** "2 Oct 2026, 14:05" in the given time zone. */
export function formatDateTime(iso: string | null | undefined, timeZone: string): string {
  const d = toDate(iso)
  return d ? formatter(timeZone, true).format(d) : "—"
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
]

/** "3 hours ago" */
export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  const d = toDate(iso)
  if (!d) return "—"
  const seconds = Math.round((d.getTime() - now) / 1000)
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return "just now"
}

/** Published, but the publish date is still in the future. */
export function isScheduled(status: unknown, publishedAt: unknown, now = Date.now()): boolean {
  const d = typeof publishedAt === "string" ? toDate(publishedAt) : null
  return status === "published" && d !== null && d.getTime() > now
}

/** ISO string → value for <input type="datetime-local"> in the browser's time zone. */
export function isoToLocalInput(iso: string | null | undefined): string {
  const d = toDate(iso)
  if (!d) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** <input type="datetime-local"> value (browser time zone) → ISO string, or "" when empty. */
export function localInputToIso(value: string): string {
  if (!value) return ""
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "" : d.toISOString()
}
