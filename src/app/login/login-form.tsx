"use client"

import { ArrowRightIcon, CircleAlertIcon, EyeIcon, EyeOffIcon, LockKeyholeIcon, MailIcon } from "lucide-react"
import { AnimatePresence, motion, useAnimate } from "motion/react"
import { useRouter } from "next/navigation"
import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"

const inputGroup = "h-11 rounded-xl bg-white/80 dark:bg-white/[0.04]"

// Signs in from the browser, so Supabase's per-IP rate limit applies to each visitor rather than to our server.
export function LoginForm({ next }: { next: string }) {
  const router = useRouter()
  const [scope, animate] = useAnimate<HTMLFormElement>()
  // Controlled, so React's automatic form reset after an action keeps the email
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)

  const [error, formAction, pending] = useActionState(
    async (_previous: string | null, formData: FormData): Promise<string | null> => {
      const fail = (message: string) => {
        void animate(scope.current, { x: [0, -10, 9, -6, 4, -2, 0] }, { duration: 0.45, ease: "easeOut" })
        return message
      }
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      })
      if (error) {
        return fail(
          error.status === 429 ? "Too many attempts. Please try again in a few minutes." : "Invalid email or password.",
        )
      }

      const { data: admin } = await supabase
        .from("eu_admins")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle()
      if (!admin) {
        await supabase.auth.signOut()
        return fail("This account does not have access to the CMS.")
      }

      router.replace(next)
      router.refresh()
      return null
    },
    null,
  )

  return (
    <form ref={scope} action={formAction}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <InputGroup className={inputGroup}>
            <InputGroupAddon className="pl-3">
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@eucareerserwis.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <InputGroup className={inputGroup}>
            <InputGroupAddon className="pl-3">
              <LockKeyholeIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
              onBlur={() => setCapsLock(false)}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                className="mr-1 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <AnimatePresence initial={false}>
            {capsLock && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-medium text-amber-700 dark:text-amber-300"
              >
                Caps Lock is on
              </motion.p>
            )}
          </AnimatePresence>
        </Field>

        <AnimatePresence initial={false} mode="popLayout">
          {error && !pending && (
            <motion.p
              key={error}
              role="alert"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
            >
              <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="group/submit mt-1 h-11 w-full overflow-hidden rounded-xl text-[0.95rem] before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-transparent before:via-white/45 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-full"
        >
          {pending ? (
            <>
              <Spinner />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRightIcon className="transition-transform duration-200 group-hover/submit:translate-x-0.5" />
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}
