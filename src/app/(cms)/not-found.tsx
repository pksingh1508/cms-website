import { NotFoundPanel } from "@/components/not-found-panel"

export default function NotFound() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center p-6">
      <NotFoundPanel
        title="This page doesn't exist"
        description="The item may have been deleted, or the address is wrong."
      />
    </div>
  )
}
