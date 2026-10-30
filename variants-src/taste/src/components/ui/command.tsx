import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

// taste-skill round 2. Rows on a 36px pitch with the nav's grey pill as the highlighted row (the
// selected state of a list, app-screens.md 7.8); group headings 12px grey sentence case (7.2); no
// tracked shortcut letters (same fix as round 1's dropdown). The search field is 40px in a popover and
// 48px in the menu, with the 14px grey icon of a toolbar search (8.1).
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive data-slot="command" className={cn("bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-lg", className)} {...props} />
}
function CommandDialog({ title = "Command menu", description = "Search for a command to run…", children, ...props }: React.ComponentProps<typeof Dialog> & { title?: string; description?: string }) {
  return (
    <Dialog {...props}>
      {/* The menu sits high and grows down, so typing never moves the field. The title and description
          now live inside the dialog content, where Radix and screen readers expect them (a11y fix). */}
      <DialogContent className="top-[16%] translate-y-0 gap-0 overflow-hidden rounded-lg p-0 sm:max-w-[560px] [&>button:last-child]:top-2 [&>button:last-child]:right-2 [&>button:last-child]:inline-flex [&>button:last-child]:size-8 [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child]:rounded-md">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command className="**:data-[slot=command-input-wrapper]:h-12 **:data-[slot=command-input-wrapper]:pr-12 **:data-[slot=command-list]:max-h-[360px]">{children}</Command>
      </DialogContent>
    </Dialog>
  )
}
function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="border-rule flex h-10 items-center gap-2.5 border-b px-3">
      <SearchIcon className="text-muted-foreground size-3.5 shrink-0" />
      <CommandPrimitive.Input data-slot="command-input" className={cn("placeholder:text-muted-foreground flex h-full w-full bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-60", className)} {...props} />
    </div>
  )
}
function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List data-slot="command-list" className={cn("max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", className)} {...props} />
}
function CommandEmpty(props: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className="text-muted-foreground px-3 py-6 text-center text-sm" {...props} />
}
function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group data-slot="command-group" className={cn("text-foreground overflow-hidden p-1.5 [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-1.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-normal [&+&]:border-rule [&+&]:border-t", className)} {...props} />
}
function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={cn("bg-rule -mx-1 h-px", className)} {...props} />
}
function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item data-slot="command-item" className={cn("data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex h-9 cursor-default items-center gap-2.5 rounded-md px-2 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props} />
}
function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="command-shortcut" className={cn("text-muted-foreground ml-auto text-xs", className)} {...props} />
}
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator }
