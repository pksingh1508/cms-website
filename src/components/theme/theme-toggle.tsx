"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsClient } from "@/hooks/use-is-client"
import { centerOf, switchTheme } from "@/lib/theme-transition"
import { cn } from "@/lib/utils"

/** Sun/moon button. The new theme spreads out from the button as a circle. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const isClient = useIsClient()
  const dark = isClient && resolvedTheme === "dark"
  const label = dark ? "Switch to light mode" : "Switch to dark mode"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className={cn("relative overflow-hidden", className)}
            onClick={(e) => switchTheme(dark ? "light" : "dark", setTheme, centerOf(e.currentTarget))}
          />
        }
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={dark ? "moon" : "sun"}
            className="flex"
            initial={{ y: 14, rotate: -60, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
            exit={{ y: -14, rotate: 60, opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            {dark ? <MoonIcon /> : <SunIcon />}
          </motion.span>
        </AnimatePresence>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
