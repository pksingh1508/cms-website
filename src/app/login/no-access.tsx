import { LogOutIcon, ShieldAlertIcon } from "lucide-react"
import { logout } from "@/actions/auth"
import { Button } from "@/components/ui/button"

/** Signed in, but not on the admin list. */
export function NoAccess({ email }: { email: string }) {
  return (
    <div className="space-y-5 text-center">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <ShieldAlertIcon className="size-5" />
        </span>
        <p className="text-sm text-muted-foreground">
          {email ? <span className="block truncate font-medium text-foreground">{email}</span> : "This account"} isn't
          allowed to use the CMS. Ask an administrator to add you.
        </p>
      </div>
      <form action={logout}>
        <Button type="submit" variant="outline" size="lg" className="h-11 w-full rounded-xl">
          <LogOutIcon />
          Sign out
        </Button>
      </form>
    </div>
  )
}
