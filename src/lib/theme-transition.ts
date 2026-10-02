import { flushSync } from "react-dom"

export type ThemeChoice = "light" | "dark" | "system"

/**
 * Changes the theme with a circle that grows out of `origin` (the View Transitions API).
 * Without View Transitions support, or with reduced motion, the theme simply switches.
 */
export function switchTheme(choice: ThemeChoice, setTheme: (theme: string) => void, origin?: { x: number; y: number }) {
  const root = document.documentElement
  const next = choice === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : choice
  const current = root.classList.contains("dark") ? "dark" : "light"

  const apply = () => {
    const restore = pauseTransitions()
    flushSync(() => setTheme(choice))
    // next-themes updates <html> in an effect; do it here too so the new snapshot is already in the new theme
    root.classList.remove("light", "dark")
    root.classList.add(next)
    root.style.colorScheme = next
    restore()
  }

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches
  if (next === current || reduceMotion || typeof document.startViewTransition !== "function") {
    apply()
    return
  }

  const { x, y } = origin ?? { x: innerWidth / 2, y: 0 }
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  const transition = document.startViewTransition(apply)
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
      )
    })
    .catch(() => {}) // skipped transitions (e.g. a second click) still switch the theme
}

/** Colour transitions would otherwise animate inside the snapshot and smear the reveal. */
function pauseTransitions() {
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(style)
  return () => {
    getComputedStyle(document.body) // apply the new colours while transitions are still off
    requestAnimationFrame(() => style.remove())
  }
}

/** Centre of an element, as the origin of the reveal (works for clicks and keyboard). */
export function centerOf(element: Element) {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}
