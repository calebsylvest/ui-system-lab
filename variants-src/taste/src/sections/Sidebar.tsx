import { BarChart3, ChevronsUpDown, Clock, FolderKanban, LifeBuoy, Receipt, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"

/** Fieldwork's mark: a field of three furrows, drawn in the one brand hue. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn("size-5 shrink-0", className)}>
      <rect width="20" height="20" rx="5" fill="var(--brand)" />
      <path d="M4 14.5 10.5 4M8 16l6.5-10.5M12 16.5l4-6.5" stroke="var(--background)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export const navLinks = [
  { label: "Projects", icon: FolderKanban },
  { label: "Clients", icon: Users },
  { label: "Time", icon: Clock },
  { label: "Invoices", icon: Receipt },
  { label: "Reports", icon: BarChart3 },
]

export function NavList({ className }: { className?: string }) {
  return (
    <nav aria-label="Main" className={cn("grid gap-0.5", className)}>
      {navLinks.map(({ label, icon: Icon }, i) => (
        <a key={label} href="#" aria-current={i === 0 ? "page" : undefined}
          className={cn(
            "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            i === 0 ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          )}>
          <Icon className="size-4 shrink-0" strokeWidth={1.6} /> {label}
        </a>
      ))}
    </nav>
  )
}

export function WorkspaceSwitcher() {
  return (
    <button type="button" className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-secondary/60 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      <Mark />
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-5 font-semibold">Fieldwork</span>
        <span className="text-muted-foreground block truncate text-xs leading-4">Fieldwork Studio</span>
      </span>
      <ChevronsUpDown className="text-muted-foreground size-4" strokeWidth={1.6} />
    </button>
  )
}

/** Framed-sheet shell: the sidebar sits on the tinted frame, no rule against the top bar. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col gap-5 px-3 pt-2 pb-4 lg:flex">
      <div className="flex h-10 items-center"><WorkspaceSwitcher /></div>
      <NavList />
      <div className="mt-auto grid gap-0.5">
        {[{ label: "Settings", icon: Settings }, { label: "Help", icon: LifeBuoy }].map(({ label, icon: Icon }) => (
          <a key={label} href="#" className="text-muted-foreground hover:text-foreground hover:bg-secondary/60 flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <Icon className="size-4" strokeWidth={1.6} /> {label}
          </a>
        ))}
      </div>
    </aside>
  )
}
