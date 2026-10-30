import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// taste-skill round 2: the side panel repeats the style's one move (framed-sheet). It is a second
// white sheet, inset 8px from the window edges like the page sheet, with 16px corners and a 1px edge.
// It floats over the page, so it alone gets a soft drop (app-screens.md 9.4, 13). Drawers open in
// 320ms on ease-out and leave faster (motion.md 3: drawers 250-450ms, leaving about 70%).
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) { return <SheetPrimitive.Root data-slot="sheet" {...props} /> }
function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) { return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} /> }
function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) { return <SheetPrimitive.Close data-slot="sheet-close" {...props} /> }
function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return <SheetPrimitive.Overlay data-slot="sheet-overlay" className={cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=open]:duration-300 data-[state=closed]:duration-200", className)} {...props} />
}
function SheetContent({ className, children, side = "right", ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content data-slot="sheet-content" className={cn(
        "bg-background border-sheet-edge fixed z-50 flex flex-col overflow-hidden rounded-2xl border outline-none",
        "shadow-[0_16px_48px_rgb(19_20_22/0.12)]", // taste-skill-ignore: a drawer floats over the page
        "ease-ui data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-[320ms] data-[state=closed]:duration-[220ms]",
        side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-2 right-2 w-[calc(100%-16px)] sm:max-w-[400px]",
        side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-2 left-2 w-[calc(100%-16px)] sm:max-w-[400px]",
        side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-2 top-2 h-auto",
        side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-2 bottom-2 h-auto",
        className)} {...props}>
        {children}
        <SheetPrimitive.Close className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring/50 absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none">
          <XIcon className="size-4" /><span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sheet-header" className={cn("flex flex-col gap-1 px-6 pt-6 pr-14 pb-5", className)} {...props} /> }
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sheet-footer" className={cn("border-rule mt-auto flex flex-row-reverse items-center justify-start gap-2 border-t px-6 py-4", className)} {...props} /> }
function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) { return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-foreground text-base leading-6 font-semibold", className)} {...props} /> }
function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) { return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-muted-foreground text-sm", className)} {...props} /> }
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
