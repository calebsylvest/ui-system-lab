import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) { return <SheetPrimitive.Root data-slot="sheet" {...props} /> }
function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) { return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} /> }
function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) { return <SheetPrimitive.Close data-slot="sheet-close" {...props} /> }
/** Overlay is paired with the panel: same duration and easing in both directions. */
function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return <SheetPrimitive.Overlay data-slot="sheet-overlay" className={cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:ease-out data-[state=closed]:ease-in data-[state=open]:duration-300 data-[state=closed]:duration-200 fixed inset-0 z-50 bg-black/50", className)} {...props} />
}
/**
 * Large surface: 300ms in on the default ease-out, 200ms out on ease-in (~70%).
 * It slides in from its edge and leaves the same way. Elevation is shadow-xl instead of a 1px border.
 * Safe-area insets pad the edge that touches the device frame.
 */
function SheetContent({ className, children, side = "right", ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content data-slot="sheet-content" className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:ease-out data-[state=closed]:ease-in data-[state=open]:duration-300 data-[state=closed]:duration-200 fixed z-50 flex flex-col gap-4 shadow-xl outline-hidden",
        side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] sm:max-w-sm",
        side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 pl-[env(safe-area-inset-left)] pb-[env(safe-area-inset-bottom)] sm:max-w-sm",
        side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto pt-[env(safe-area-inset-top)]",
        side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto pb-[env(safe-area-inset-bottom)]",
        className)} {...props}>
        {children}
        <SheetPrimitive.Close className="hit-area text-muted-foreground absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-md transition-[color,background-color] hover:bg-accent hover:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon aria-hidden /><span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}
/** pr-12 keeps the title clear of the close button. */
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4 pr-12", className)} {...props} /> }
/** Same order as DialogFooter: primary action last on wide screens, first (bottom-most reachable) when stacked. */
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end", className)} {...props} /> }
function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) { return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-foreground font-semibold", className)} {...props} /> }
function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) { return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-muted-foreground text-sm", className)} {...props} /> }
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
