import { useEffect, useRef } from "react"
import { Bell, LogOut, Search, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const links = ["Projects", "Clients", "Time", "Invoices", "Reports"]
const unread = 3

function goToSettings() {
  const el = document.getElementById("settings")
  el?.scrollIntoView({ block: "start" })
  document.getElementById("ws-name")?.focus({ preventScroll: true })
}

export function TopNav() {
  const search = useRef<HTMLInputElement>(null)

  // The shortcuts the menu advertises actually work: "/" focuses search, Cmd/Ctrl+, opens settings.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      if ((e.metaKey || e.ctrlKey) && e.key === ",") { e.preventDefault(); goToSettings() }
      else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); search.current?.focus() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:ring-[3px] focus:ring-ring/50">Skip to content</a>
      <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-x-6 px-4">
        <a href="#" className="flex h-14 items-center font-semibold rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Fieldwork</a>
        {/* Below md the links wrap to their own scrollable row instead of disappearing. */}
        <nav aria-label="Primary" className="order-last -mx-4 flex w-full items-center gap-5 overflow-x-auto px-4 text-sm md:order-none md:mx-0 md:w-auto md:overflow-visible md:px-0">
          {links.map((l, i) => (
            <a key={l} href="#" aria-current={i === 0 ? "page" : undefined}
              className="flex h-11 shrink-0 items-center text-muted-foreground decoration-2 underline-offset-[0.9rem] transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-[current=page]:underline md:h-14 md:underline-offset-[1.15rem]">
              {l}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <form role="search" className="relative" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="nav-search" className="sr-only">Search projects</label>
            <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input ref={search} id="nav-search" type="search" placeholder="Search projects" className="w-36 pl-8 pr-8 sm:w-56" />
            <kbd aria-hidden className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border px-1.5 text-xs text-muted-foreground sm:block">/</kbd>
          </form>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Notifications, ${unread} unread`} className="relative">
                <Bell />
                {/* The unread count is visible, not hover-only. */}
                <span aria-hidden className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground">{unread}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{unread} unread notifications</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" aria-label="Account menu, Chris Sutton">
                <Avatar><AvatarFallback>CS</AvatarFallback></Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Chris Sutton</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User /> Profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={goToSettings}><Settings /> Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive"><LogOut /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
