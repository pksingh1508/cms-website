"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { motion } from "motion/react"
import Form from "next/form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useOptimistic, useRef, useTransition } from "react"
import { listHref } from "@/components/items/list-href"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import type { ContentStatus } from "@/config/collections"
import { cn } from "@/lib/utils"

const TABS: { label: string; status?: ContentStatus }[] = [
  { label: "All" },
  { label: "Published", status: "published" },
  { label: "Drafts", status: "draft" },
]

export function ListToolbar({
  slug,
  searchPlaceholder,
  q,
  status,
}: {
  slug: string
  searchPlaceholder: string
  q: string
  status?: ContentStatus
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  // The highlight moves as soon as a tab is clicked, while the new list loads
  const [activeStatus, setActiveStatus] = useOptimistic(status)
  const search = useRef<HTMLInputElement>(null)

  // "/" jumps to the search box
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return
      e.preventDefault()
      search.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav
        aria-label="Filter by status"
        className="isolate inline-flex w-fit gap-0.5 rounded-xl border bg-muted/70 p-1 shadow-[inset_0_1px_2px_oklch(0_0_0/0.04)]"
      >
        {TABS.map((tab) => {
          const active = tab.status === activeStatus
          const href = listHref(slug, { q, status: tab.status })
          return (
            <Link
              key={tab.label}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
                e.preventDefault()
                startTransition(() => {
                  setActiveStatus(tab.status)
                  router.push(href)
                })
              }}
              className={cn(
                "relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId={`status-tab-${slug}`}
                  transition={{ type: "spring", stiffness: 520, damping: 40 }}
                  className="absolute inset-0 -z-10 rounded-lg bg-card shadow-sm ring-1 ring-foreground/[0.06] dark:bg-white/10 dark:ring-white/[0.06]"
                />
              )}
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <Form action={`/${slug}`} className="w-full sm:w-80" role="search">
        {status && <input type="hidden" name="status" value={status} />}
        <InputGroup className="rounded-xl">
          <InputGroupAddon className="pl-3">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            ref={search}
            key={q}
            name="q"
            type="search"
            defaultValue={q}
            placeholder={searchPlaceholder}
            aria-label="Search"
            className="[&::-webkit-search-cancel-button]:hidden"
          />
          <InputGroupAddon align="inline-end" className="pr-2">
            {q ? (
              <InputGroupButton
                size="icon-xs"
                aria-label="Clear search"
                className="rounded-md"
                onClick={() => router.push(listHref(slug, { status }))}
              >
                <XIcon />
              </InputGroupButton>
            ) : (
              <Kbd className="hidden border bg-background sm:inline-flex">/</Kbd>
            )}
          </InputGroupAddon>
        </InputGroup>
      </Form>
    </div>
  )
}
