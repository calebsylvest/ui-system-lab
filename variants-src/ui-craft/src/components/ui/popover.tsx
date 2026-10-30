import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) { return <PopoverPrimitive.Root data-slot="popover" {...props} /> }
function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) { return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} /> }
/**
 * Elevated with shadow-lg (no border), radius-lg like the menus.
 * Motion matches dropdown-menu: 150ms ease-out in, 100ms ease-in out (~70%), scale from 0.95,
 * growing from the trigger via the Radix transform-origin variable.
 */
function PopoverContent({ className, align = "center", sideOffset = 4, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content data-slot="popover-content" align={align} sideOffset={sideOffset} className={cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:ease-out data-[state=closed]:ease-in data-[state=open]:duration-150 data-[state=closed]:duration-100 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 max-h-(--radix-popover-content-available-height) origin-(--radix-popover-content-transform-origin) overflow-y-auto overscroll-contain rounded-lg p-4 shadow-lg outline-hidden", className)} {...props} />
    </PopoverPrimitive.Portal>
  )
}
export { Popover, PopoverTrigger, PopoverContent }
