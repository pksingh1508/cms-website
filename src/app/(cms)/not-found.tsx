import { ButtonLink } from "@/components/button-link"

export default function NotFound() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold tracking-tight">This page doesn't exist</h1>
      <p className="max-w-sm text-sm text-muted-foreground">The item may have been deleted, or the address is wrong.</p>
      <ButtonLink href="/">Go to the home page</ButtonLink>
    </div>
  )
}
