import { ArrowRightIcon, PlusIcon } from "lucide-react"
import * as motion from "motion/react-client"
import Link from "next/link"
import { ButtonLink } from "@/components/button-link"
import { CollectionIcon } from "@/components/collection-icon"
import { SpotlightCard } from "@/components/effects/spotlight-card"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { PageHeader } from "@/components/shell/page-header"
import { COLLECTIONS } from "@/config/collections"
import { site } from "@/config/site"
import { requireAdmin } from "@/lib/auth"
import { countItems } from "@/lib/items"
import { serverEnv } from "@/lib/server-env"

const EASE = [0.16, 1, 0.3, 1] as const

function greeting(timeZone: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone }).format(new Date()),
  )
  if (hour >= 5 && hour < 12) return "Good morning"
  if (hour >= 12 && hour < 18) return "Good afternoon"
  return "Good evening"
}

export default async function HomePage() {
  const user = await requireAdmin()
  const counts = await Promise.all(COLLECTIONS.map((c) => countItems(c.table)))
  const { APP_TIME_ZONE: timeZone } = serverEnv()
  const name = user.email.split("@")[0]
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone }).format(
    new Date(),
  )
  const published = counts.reduce((sum, c) => sum + c.published, 0)
  const drafts = counts.reduce((sum, c) => sum + c.drafts, 0)

  return (
    <>
      <PageHeader crumbs={[{ label: "Home" }]} />
      <div className="mx-auto w-full max-w-6xl space-y-10 p-4 sm:p-6 lg:p-8">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative isolate overflow-hidden rounded-3xl border bg-card p-6 shadow-sm sm:p-8 dark:shadow-[inset_0_1px_0_var(--highlight)]"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-28 -right-20 size-96 rounded-full bg-brand/30 blur-3xl dark:bg-brand/12" />
            <div className="absolute right-56 -bottom-40 size-80 rounded-full bg-sky-400/20 blur-3xl dark:bg-blue-500/12" />
            <div className="absolute inset-0 bg-grid mask-radial-from-0% mask-radial-to-65% mask-radial-at-top-right" />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-500 text-emerald-500" />
                {today}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {greeting(timeZone)}
                {name && (
                  <>
                    , <span className="text-gradient-brand">{name}</span>
                  </>
                )}
              </h1>
              <p className="max-w-md text-muted-foreground">
                Everything on {site.websiteHost} in one place. Pick a section to add or edit content.
              </p>
            </div>

            <dl className="grid grid-cols-3 gap-2 sm:gap-3">
              <HeroStat label="Published" value={published} />
              <HeroStat label={drafts === 1 ? "Draft" : "Drafts"} value={drafts} />
              <HeroStat label="Sections" value={COLLECTIONS.length} />
            </dl>
          </div>
        </motion.section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Content</h2>
              <p className="text-sm text-muted-foreground">Choose what you want to add or edit.</p>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {COLLECTIONS.map((collection, i) => {
              const { published: live, drafts: draft } = counts[i]
              return (
                <motion.li
                  key={collection.slug}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE, delay: 0.12 + i * 0.06 }}
                >
                  <SpotlightCard tone={collection.tone} className="flex h-full flex-col">
                    {/* The whole card opens the list; the Add button sits above this link */}
                    <Link
                      href={`/${collection.slug}`}
                      aria-label={`Open ${collection.label}`}
                      className="absolute inset-0 z-0 rounded-[inherit] focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
                    />
                    <div className="pointer-events-none relative flex items-start justify-between gap-3 p-5 pb-0">
                      <CollectionIcon
                        collection={collection}
                        size="lg"
                        className="transition-transform duration-300 ease-spring group-hover/card:scale-105 group-hover/card:-rotate-3"
                      />
                      <ButtonLink
                        href={`/${collection.slug}/new`}
                        size="sm"
                        variant="outline"
                        className="pointer-events-auto relative z-10"
                      >
                        <PlusIcon />
                        Add
                      </ButtonLink>
                    </div>
                    <div className="pointer-events-none relative space-y-1 px-5 pt-4">
                      <h3 className="font-semibold tracking-tight">{collection.label}</h3>
                      <p className="text-sm text-muted-foreground">{collection.description}</p>
                    </div>
                    <div className="pointer-events-none relative mt-auto flex items-end justify-between gap-3 px-5 pt-6 pb-5">
                      <div className="flex items-baseline gap-2">
                        <AnimatedNumber value={live} className="text-3xl font-semibold tracking-tight" />
                        <span className="text-sm text-muted-foreground">published</span>
                        {draft > 0 && (
                          <span className="ml-1 rounded-full bg-amber-500/12 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                            {draft} {draft === 1 ? "draft" : "drafts"}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover/card:text-foreground">
                        View
                        <ArrowRightIcon className="size-4 transition-transform duration-300 ease-spring group-hover/card:translate-x-1" />
                      </span>
                    </div>
                  </SpotlightCard>
                </motion.li>
              )
            })}
          </ul>
        </section>
      </div>
    </>
  )
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-2xl border bg-background/60 px-4 py-3 backdrop-blur">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tracking-tight">
        <AnimatedNumber value={value} />
      </dd>
    </div>
  )
}
