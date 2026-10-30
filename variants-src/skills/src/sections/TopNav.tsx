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

export function TopNav() {
  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="mx-auto flex min-h-(--header-height) max-w-6xl items-center gap-4 px-4 md:gap-6">
        <a href="#" className="shrink-0 font-semibold">Fieldwork</a>
        {/* Below md the links scroll sideways instead of disappearing; the clipped link is the cue */}
        <nav aria-label="Primary" className="-mx-1 flex min-w-0 flex-1 items-center gap-4 overflow-x-auto px-1 py-2 text-sm md:flex-none">
          {links.map((l, i) => (
            <a key={l} href="#" aria-current={i === 0 ? "page" : undefined}
              className={i === 0 ? "shrink-0 font-medium" : "shrink-0 text-muted-foreground transition-colors duration-150 hover:text-foreground"}>
              {l}
            </a>
          ))}
        </nav>
        <div className="ms-auto flex shrink-0 items-center gap-2">
          <form role="search" className="relative hidden sm:block" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="nav-search" className="sr-only">Search projects</label>
            <Search strokeWidth={1.5} className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="nav-search" name="q" type="search" placeholder="Search projects" className="w-56 ps-8" />
          </form>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell />
              </Button>
            </TooltipTrigger>
            <TooltipContent>3 unread notifications</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full" aria-label="Account menu">
                <Avatar><AvatarFallback>CS</AvatarFallback></Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Chris Sutton</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User /> Profile <DropdownMenuShortcut>⇧P</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem><Settings /> Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><LogOut /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
