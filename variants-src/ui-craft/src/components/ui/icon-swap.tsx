import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * CSS-only cross-fade between two icons (surface-motion polish recipe).
 * Both icons stay mounted so the control never resizes; no motion library needed.
 * Transitions only run on change, so the default state does not animate on load.
 */
function IconSwap({ active, activeIcon, inactiveIcon, className }: {
  active: boolean
  activeIcon: React.ReactNode
  inactiveIcon: React.ReactNode
  className?: string
}) {
  const layer = "grid place-items-center transition-[opacity,scale,filter] duration-200 ease-out"
  return (
    <span data-slot="icon-swap" aria-hidden className={cn("relative inline-grid shrink-0 place-items-center", className)}>
      <span className={cn(layer, "absolute inset-0", active ? "scale-100 opacity-100 blur-0" : "scale-50 opacity-0 blur-[2px]")}>{activeIcon}</span>
      <span className={cn(layer, active ? "scale-50 opacity-0 blur-[2px]" : "scale-100 opacity-100 blur-0")}>{inactiveIcon}</span>
    </span>
  )
}

export { IconSwap }
