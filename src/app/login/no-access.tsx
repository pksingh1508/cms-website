import { ShieldAlertIcon } from "lucide-react"
import { logout } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

/** Signed in, but not on the admin list. */
export function NoAccess({ email }: { email: string }) {
  return (
    <Card>
      <CardContent className="space-y-4 text-center">
        <ShieldAlertIcon className="mx-auto size-8 text-amber-600" />
        <div className="space-y-1">
          <p className="font-medium">No access</p>
          <p className="text-sm text-muted-foreground">
            {email ? <span className="font-medium text-foreground">{email}</span> : "This account"} isn't allowed to use
            the CMS. Ask an administrator to add you.
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" className="w-full">
            Sign out
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
