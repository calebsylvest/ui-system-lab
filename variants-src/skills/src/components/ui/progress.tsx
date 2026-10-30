import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root data-slot="progress" className={cn("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className)} {...props}>
      {/* Logical fill: translates from the inline-start edge, mirrored under dir="rtl" */}
      <ProgressPrimitive.Indicator data-slot="progress-indicator" className="bg-primary h-full w-full flex-1 -translate-x-(--progress-rest) rtl:translate-x-(--progress-rest) motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out" style={{ "--progress-rest": `${100 - (value || 0)}%` } as React.CSSProperties} />
    </ProgressPrimitive.Root>
  )
}
export { Progress }
