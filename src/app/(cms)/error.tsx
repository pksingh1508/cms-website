"use client"

import { TriangleAlertIcon } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function CmsError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 p-6 text-center">
      <TriangleAlertIcon className="size-8 text-destructive" />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page could not be loaded. Check your connection and try again.
          {error.digest && <span className="mt-1 block font-mono text-xs">Reference: {error.digest}</span>}
        </p>
      </div>
      <Button onClick={() => retry()}>Try again</Button>
    </div>
  )
}
