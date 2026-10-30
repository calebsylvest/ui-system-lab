"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { spring, exitFallbackMs } from "@/lib/springs"
import { fontWeights } from "@/lib/font-weight"
import { useIcons } from "@/lib/icon-context"
import { useSizeVariant, typeClass } from "@/lib/size-context"
import { SurfaceProvider, useSurface } from "@/lib/surface-context"
import { surfaceClasses } from "@/lib/surface-classes"
import { Button } from "@/components/ui/button"

// Fluid treatment of shadcn's Sheet. Fluid ships no side panel, so this mirrors
// its Dialog: the panel is 4 surface steps above the substrate and re-provides
// that level (Surfaces), side panels ride spring.slow in and its quicker exit
// tween out (Motion: "large surfaces: dialogs, side panels"), the slide is a
// transform so MotionConfig reducedMotion turns it into a plain fade, and the
// corner ✕ is a ghost icon Button like the Dialog's.

const SheetOpenContext = React.createContext(false)
const SHEET_OFFSET = 4

function Sheet({ open: openProp, defaultOpen, onOpenChange, ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false)
  const open = openProp ?? uncontrolled
  return (
    <SheetOpenContext.Provider value={open}>
      <SheetPrimitive.Root
        data-slot="sheet"
        open={open}
        onOpenChange={(next) => { setUncontrolled(next); onOpenChange?.(next) }}
        {...props}
      />
    </SheetOpenContext.Provider>
  )
}
function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) { return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} /> }
function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) { return <SheetPrimitive.Close data-slot="sheet-close" {...props} /> }

function SheetContent({ className, children, side = "right", ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "right" | "left" }) {
  const open = React.useContext(SheetOpenContext)
  const icons = useIcons()
  const XIcon = icons.x
  const level = Math.min(useSurface() + SHEET_OFFSET, 8)
  const [mounted, setMounted] = React.useState(false)
  if (open && !mounted) setMounted(true)

  React.useEffect(() => {
    if (open) return
    const id = setTimeout(() => setMounted(false), exitFallbackMs(spring.slow))
    return () => clearTimeout(id)
  }, [open])

  if (!mounted) return null
  const away = side === "right" ? "100%" : "-100%"

  return (
    <SheetPrimitive.Portal forceMount>
      <SheetPrimitive.Overlay asChild forceMount>
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 dark:bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: open ? 1 : 0 }}
          transition={open ? spring.slow : spring.slow.exit}
        />
      </SheetPrimitive.Overlay>
      <SheetPrimitive.Content data-slot="sheet-content" asChild forceMount {...props}>
        <motion.div
          className={cn(
            "fixed inset-y-0 z-50 flex w-[min(400px,calc(100%-2rem))] flex-col gap-6 p-6 focus:outline-none",
            side === "right" ? "right-0" : "left-0",
            surfaceClasses(level),
            className
          )}
          initial={{ opacity: 0, x: away }}
          animate={{ opacity: open ? 1 : 0, x: open ? 0 : away }}
          transition={open ? spring.slow : spring.slow.exit}
          onAnimationComplete={() => { if (!open) setMounted(false) }}
        >
          <SurfaceProvider value={level}>
            {children}
            <SheetPrimitive.Close asChild>
              <Button variant="ghost" size="icon-compact" className="absolute right-3 top-3">
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            </SheetPrimitive.Close>
          </SurfaceProvider>
        </motion.div>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
}
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex justify-end gap-2", className)} {...props} />
}
function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  const v = useSizeVariant() === "compact" ? "compact" : "default"
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn(typeClass("title", v), "text-foreground", className)} style={{ fontVariationSettings: fontWeights.semibold }} {...props} />
}
function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  const v = useSizeVariant() === "compact" ? "compact" : "default"
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn(typeClass("body", v), "text-muted-foreground", className)} {...props} />
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
