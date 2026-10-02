"use client"

import { RotateCwIcon, TriangleAlertIcon } from "lucide-react"
import { motion } from "motion/react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function CmsError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[70svh] items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-w-md flex-col items-center gap-5 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/15 ring-inset">
          <TriangleAlertIcon className="size-6" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            The page could not be loaded. Check your connection and try again.
          </p>
          {error.digest && <p className="pt-1 font-mono text-xs text-muted-foreground/80">Reference: {error.digest}</p>}
        </div>
        <Button onClick={() => retry()}>
          <RotateCwIcon />
          Try again
        </Button>
      </motion.div>
    </div>
  )
}
