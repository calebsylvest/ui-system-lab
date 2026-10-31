import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : startValue)
  // Lab fix (round 3): the shipped useSpring (damping 60, stiffness 100) is heavily overdamped, so
  // its tail kept a requestAnimationFrame loop running for ~8 s after the number had visibly
  // settled. A finite ease-out tween ends exactly when the count does.
  const isInView = useInView(ref, { once: true, margin: "0px" })
  // Lab fix (round 2): MotionConfig reducedMotion="user" does not cover imperative animation, so jump straight to the value.
  const reduceMotion = useReducedMotion()

  // Subscribe before the animate/jump effect below, so a jump on mount is written to the DOM.
  useEffect(() => {
    let last = ""
    return motionValue.on("change", (latest) => {
      const next = format(latest)
      // Only touch the DOM when the visible text changes, so the tail of the tween causes no layout.
      if (ref.current && next !== last) {
        ref.current.textContent = next
        last = next
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionValue, decimalPlaces])

  const mountValue = useRef(value)

  useEffect(() => {
    const target = direction === "down" ? startValue : value
    if (reduceMotion) {
      motionValue.jump(target)
      return
    }
    if (!isInView) {
      // Lab fix (round 3): useInView({ once }) never fires for a ticker that stays off-screen, so a
      // value that changed there (e.g. a filtered total) was left stale. Jump instead; nobody saw it.
      if (value !== mountValue.current) motionValue.jump(target)
      return
    }
    const controls = animate(motionValue, target, {
      duration: 1.1,
      delay,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [motionValue, reduceMotion, isInView, delay, value, direction, startValue])

  const format = (latest: number) =>
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(Number(latest.toFixed(decimalPlaces)))

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tracking-wider text-black tabular-nums dark:text-white",
        className
      )}
      {...props}
    >
      {/* Lab fix (round 3): first paint uses the same formatting as the ticks (was the raw number). */}
      {format(direction === "down" ? value : startValue)}
    </span>
  )
}
