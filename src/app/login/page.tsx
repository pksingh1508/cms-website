import { ShieldCheckIcon } from "lucide-react"
import * as motion from "motion/react-client"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { BrandMark } from "@/components/brand"
import { AuroraBackground } from "@/components/effects/aurora-background"
import { BorderBeam } from "@/components/effects/border-beam"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { site } from "@/config/site"
import { getCurrentUser } from "@/lib/auth"
import { LoginForm } from "./login-form"
import { NoAccess } from "./no-access"

export const metadata: Metadata = { title: "Sign in" }

/** Only same-site paths, so the login can't be used to redirect elsewhere. */
function safeNext(value: string | string[] | undefined): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : "/"
}

const EASE = [0.16, 1, 0.3, 1] as const

const item = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const user = await getCurrentUser()
  if (user?.isAdmin) redirect("/")
  const { next } = await searchParams

  return (
    <main className="relative isolate flex min-h-svh flex-col">
      <AuroraBackground />

      <header className="flex items-center justify-between p-4 sm:p-6">
        <motion.span
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
        >
          <BrandMark className="size-7 rounded-lg text-[11px]" />
          <span className="hidden sm:inline">{site.name}</span>
        </motion.span>
        <ThemeToggle className="size-9 rounded-full bg-background/40 backdrop-blur-md hover:bg-background/70" />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
        <motion.div
          className="relative w-full max-w-[25rem]"
          initial={{ opacity: 0, y: 28, scale: 0.97, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {/* Glow under the card */}
          <div
            aria-hidden
            className="absolute -inset-x-6 -top-6 -bottom-10 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_50%_40%,oklch(0.9_0.16_92/0.35),transparent)] blur-2xl dark:bg-[radial-gradient(60%_60%_at_50%_40%,oklch(0.8_0.16_90/0.12),transparent)]"
          />
          <div className="relative rounded-[1.75rem] border border-white/80 bg-white/75 p-7 shadow-xl backdrop-blur-2xl backdrop-saturate-150 sm:p-9 dark:border-white/10 dark:bg-[oklch(0.17_0.008_280/0.62)] dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.06),var(--elevation-3)]">
            <BorderBeam />
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } }}
              className="space-y-7"
            >
              <motion.div variants={item} className="flex flex-col items-center gap-4 text-center">
                <span className="relative">
                  <span className="absolute inset-0 animate-pulse rounded-2xl bg-brand/40 blur-xl" />
                  <BrandMark className="relative size-14 rounded-2xl text-xl" />
                </span>
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-semibold tracking-tight">{user ? "No access yet" : "Welcome back"}</h1>
                  <p className="text-sm text-muted-foreground">
                    {user
                      ? "You're signed in, but this account can't use the CMS."
                      : "Sign in to manage your website's content."}
                  </p>
                </div>
              </motion.div>

              <motion.div variants={item}>
                {user ? <NoAccess email={user.email} /> : <LoginForm next={safeNext(next)} />}
              </motion.div>

              <motion.p
                variants={item}
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
              >
                <ShieldCheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Access by invitation only
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <footer className="pb-6 text-center text-xs text-muted-foreground/80">
        © {new Date().getFullYear()} {site.name} · {site.product}
      </footer>
    </main>
  )
}
