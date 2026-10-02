"use client"

import { useEffect, useRef } from "react"

/** A soft light that follows the mouse (mouse and trackpad only). */
export function PointerGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !matchMedia("(pointer: fine)").matches) return
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        element.style.setProperty("--glow-x", `${event.clientX}px`)
        element.style.setProperty("--glow-y", `${event.clientY}px`)
        element.style.opacity = "1"
      })
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="absolute inset-0 opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(520px circle at var(--glow-x, 50%) var(--glow-y, 50%), var(--aurora-glow), transparent 70%)",
      }}
    />
  )
}
