import { AuroraBackground } from "@/components/effects/aurora-background"
import { NotFoundPanel } from "@/components/not-found-panel"

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-svh items-center justify-center p-6">
      <AuroraBackground />
      <NotFoundPanel title="Page not found" description="The address may be wrong, or the page has moved." />
    </main>
  )
}
