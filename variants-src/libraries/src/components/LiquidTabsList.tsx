import { useLayoutEffect, useRef, useState, type ComponentProps } from "react"
import { Liquid } from "liquid-gooey"
import { TabsList } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useIsDark, useReducedMotion } from "@/lib/effects"

type Rect = { x: number; y: number; w: number; h: number }

/**
 * shadcn TabsList whose active-tab highlight is a liquid-gooey `move` indicator
 * (the docs' "Tab indicator that stretches between tabs" recipe). It tracks the
 * Radix trigger whose data-state is "active", so Tabs stays uncontrolled.
 */
export function LiquidTabsList({ className, children, ...props }: ComponentProps<typeof TabsList>) {
  const ref = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const reduced = useReducedMotion()
  const isDark = useIsDark()

  useLayoutEffect(() => {
    const list = ref.current
    if (!list) return
    const measure = () => {
      const a = list.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]')
      if (a) setRect({ x: a.offsetLeft, y: a.offsetTop, w: a.offsetWidth, h: a.offsetHeight })
    }
    measure()
    const mo = new MutationObserver(measure)
    mo.observe(list, { subtree: true, attributes: true, attributeFilter: ["data-state"] })
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => { mo.disconnect(); ro.disconnect() }
  }, [])

  return (
    <TabsList ref={ref} className={cn("liquid-tabs relative isolate", className)} {...props}>
      <Liquid
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ position: "absolute", inset: 0 }}
        fill="var(--tab-indicator)"
        shadow={isDark ? "inset 0 0 0 1px rgba(255,255,255,.15)" : "0 1px 2px rgba(0,0,0,.08)"}
      >
        {rect && (
          <Liquid.Item effect="move" move={{ stretch: 0.6, trail: 0.35 }}>
            <div
              style={{
                position: "absolute", left: 0, top: rect.y, width: rect.w, height: rect.h, borderRadius: 6,
                transform: `translateX(${rect.x}px)`,
                // Move follows motion we drive, so we gate it for reduced motion ourselves.
                transition: reduced ? "none" : "transform 320ms cubic-bezier(.3,.7,.2,1), width 320ms ease",
              }}
            />
          </Liquid.Item>
        )}
      </Liquid>
      {children}
    </TabsList>
  )
}
