import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/** Lets CommandDialog own the query so Escape can clear it before closing. */
const CommandSearchContext = React.createContext<{ search: string; setSearch: (v: string) => void } | null>(null)

/** Takes the radius of whatever surface it sits in, so items stay concentric. */
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive data-slot="command" className={cn("bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-[inherit]", className)} {...props} />
}

/**
 * Command menu in a dialog.
 * - Keyboard-triggered and used many times a day, so it opens instantly; only the exit fades (100ms)
 *   (surface-interaction › Frequency: command palettes appear instantly).
 * - Anchored near the top instead of centred, so it does not jump while results filter.
 * - Escape clears the query first, then closes (system-patterns › Search).
 * - Arrow keys wrap around (`loop`).
 */
function CommandDialog({ title = "Command menu", description = "Search for a command to run", children, open, onOpenChange, ...props }: React.ComponentProps<typeof Dialog> & { title?: string; description?: string }) {
  const [search, setSearch] = React.useState("")
  const handleOpenChange = (next: boolean) => {
    if (!next) setSearch("")
    onOpenChange?.(next)
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange} {...props}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => { if (search) { e.preventDefault(); setSearch("") } }}
        overlayClassName="data-[state=open]:animate-none data-[state=closed]:duration-100"
        className="top-[15vh] translate-y-0 gap-0 overflow-hidden p-0 data-[state=open]:animate-none data-[state=closed]:duration-100"
      >
        <DialogHeader className="sr-only"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <CommandSearchContext.Provider value={{ search, setSearch }}>
          <Command loop label={title} className="**:data-[slot=command-input-wrapper]:h-12 **:data-[slot=command-input]:h-12 [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-item]]:py-2.5">
            {children}
          </Command>
        </CommandSearchContext.Provider>
      </DialogContent>
    </Dialog>
  )
}

/**
 * The wrapper is a <label>, so clicking the search icon focuses the input (surface-details › Input decorations).
 * Text is 16px below `sm` to avoid iOS focus zoom.
 */
function CommandInput({ className, value, onValueChange, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  const ctx = React.useContext(CommandSearchContext)
  const controlled = value !== undefined
  return (
    <label data-slot="command-input-wrapper" className="flex h-10 cursor-text items-center gap-2 border-b px-3">
      <SearchIcon aria-hidden className="text-muted-foreground pointer-events-none size-4 shrink-0" />
      <CommandPrimitive.Input
        data-slot="command-input"
        spellCheck={false}
        value={controlled ? value : ctx?.search}
        onValueChange={(v) => { onValueChange?.(v); if (!controlled) ctx?.setSearch(v) }}
        className={cn("placeholder:text-muted-foreground flex h-10 w-full bg-transparent py-3 text-base outline-hidden disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm", className)}
        {...props}
      />
    </label>
  )
}
function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List data-slot="command-list" className={cn("max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain", className)} {...props} />
}
function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={cn("text-muted-foreground px-4 py-6 text-center text-sm text-pretty", className)} {...props} />
}
function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group data-slot="command-group" className={cn("text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium", className)} {...props} />
}
function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" className={cn("bg-border -mx-1 h-px", className)} {...props} />
}
/**
 * Item radius = container radius − padding: 10px popover − 4px = 6px (radius-sm),
 * and 14px dialog − 8px group padding = 6px. Highlight is instant (high-frequency, keyboard-driven).
 */
function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item data-slot="command-item" className={cn("data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props} />
}
function CommandShortcut({ className, ...props }: React.ComponentProps<"kbd">) {
  return <kbd data-slot="command-shortcut" className={cn("text-muted-foreground ml-auto font-sans text-xs tracking-widest", className)} {...props} />
}
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator }
