"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { spring, exitFallbackMs } from "@/lib/springs"
import { popupMotionClass } from "@/lib/popup"
import { useShape } from "@/lib/shape-context"
import { Elevated } from "@/lib/elevated"

// Fluid treatment of shadcn's Popover, matching the library's own popups
// (combobox, dropdown): the panel sits 2 surface steps up with a constant
// surface-3 shadow (Surfaces), grows from the side it opened on (popupMotionClass),
// enters on spring.fast and leaves on its quicker exit tween (Motion). The portal
// stays mounted through the exit, with the exitFallbackMs timeout as a backstop.

const PopoverOpenContext = React.createContext(false)

function Popover({ open: openProp, defaultOpen, onOpenChange, ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false)
  const open = openProp ?? uncontrolled
  return (
    <PopoverOpenContext.Provider value={open}>
      <PopoverPrimitive.Root
        data-slot="popover"
        open={open}
        onOpenChange={(next) => { setUncontrolled(next); onOpenChange?.(next) }}
        {...props}
      />
    </PopoverOpenContext.Provider>
  )
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({ className, align = "center", sideOffset = 6, children, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const open = React.useContext(PopoverOpenContext)
  const shape = useShape()
  const [mounted, setMounted] = React.useState(false)
  if (open && !mounted) setMounted(true)

  React.useEffect(() => {
    if (open) return
    const id = setTimeout(() => setMounted(false), exitFallbackMs(spring.fast))
    return () => clearTimeout(id)
  }, [open])

  if (!mounted) return null

  return (
    <PopoverPrimitive.Portal forceMount>
      <PopoverPrimitive.Content data-slot="popover-content" asChild forceMount align={align} sideOffset={sideOffset} {...props}>
        <motion.div
          className={cn("z-50 outline-none", popupMotionClass)}
          initial={{ opacity: 0, y: "var(--popup-enter-y)", scaleY: 0.96 }}
          animate={open ? { opacity: 1, y: 0, scaleY: 1 } : { opacity: 0, y: "var(--popup-enter-y)", scaleY: 0.96 }}
          transition={open ? spring.fast : spring.fast.exit}
          onAnimationComplete={() => { if (!open) setMounted(false) }}
        >
          <Elevated offset={2} shadowLevel={3} className={cn("w-72 p-3 text-foreground outline-none", shape.container, className)}>
            {children}
          </Elevated>
        </motion.div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverTrigger, PopoverContent }
