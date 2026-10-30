import * as React from "react"
import { cn } from "@/lib/utils"

// container-two-div-pattern, container-callback-ref, container-use-resize-observer,
// container-guard-initial-zero, container-overflow-hidden, container-transition-delay.
// Used sparingly (container-no-excessive-use): only on a loading-state button label.
function AnimatedWidth({ className, children }: { className?: string; children: React.ReactNode }) {
  const [element, setElement] = React.useState<HTMLSpanElement | null>(null)
  const ref = React.useCallback((node: HTMLSpanElement | null) => setElement(node), [])
  const [width, setWidth] = React.useState(0)

  React.useEffect(() => {
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  return (
    <span
      data-slot="animated-width"
      className={cn("inline-flex overflow-hidden transition-[width] duration-200 ease-out delay-50 motion-reduce:transition-none", className)}
      style={{ width: width > 0 ? width : "auto" }}
    >
      <span ref={ref} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">{children}</span>
    </span>
  )
}

export { AnimatedWidth }
