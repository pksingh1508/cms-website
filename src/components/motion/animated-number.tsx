"use client"

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const format = new Intl.NumberFormat("en-GB")

/** Counts up to `value` the first time it scrolls into view. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduceMotion = useReducedMotion()
  const current = useMotionValue(0)
  const text = useTransform(current, (v) => format.format(Math.round(v)))

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      current.set(value)
      return
    }
    const controls = animate(current, value, { duration: 1.1, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [inView, reduceMotion, value, current])

  return (
    <span className={cn("tabular-nums", className)}>
      <span className="sr-only">{format.format(value)}</span>
      <motion.span ref={ref} aria-hidden>
        {text}
      </motion.span>
    </span>
  )
}
