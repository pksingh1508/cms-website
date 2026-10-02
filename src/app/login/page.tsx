import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { BrandMark } from "@/components/brand"
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

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const user = await getCurrentUser()
  if (user?.isAdmin) redirect("/")
  const { next } = await searchParams

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark className="size-11 text-sm" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{site.name}</h1>
            <p className="text-sm text-muted-foreground">{site.product}</p>
          </div>
        </div>
        {user ? <NoAccess email={user.email} /> : <LoginForm next={safeNext(next)} />}
        <p className="text-center text-xs text-muted-foreground">Access by invitation only.</p>
      </div>
    </main>
  )
}
