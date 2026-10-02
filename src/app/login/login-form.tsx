"use client"

import { LoaderCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

// Signs in from the browser, so Supabase's per-IP rate limit applies to each visitor rather than to our server.
export function LoginForm({ next }: { next: string }) {
  const router = useRouter()
  // Controlled, so React's automatic form reset after an action keeps the email
  const [email, setEmail] = useState("")
  const [error, formAction, pending] = useActionState(
    async (_previous: string | null, formData: FormData): Promise<string | null> => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      })
      if (error) {
        return error.status === 429
          ? "Too many attempts. Please try again in a few minutes."
          : "Invalid email or password."
      }

      const { data: admin } = await supabase
        .from("eu_admins")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle()
      if (!admin) {
        await supabase.auth.signOut()
        return "This account does not have access to the CMS."
      }

      router.replace(next)
      router.refresh()
      return null
    },
    null,
  )

  return (
    <Card>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <LoaderCircleIcon className="animate-spin" />}
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
