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
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <a href="#" className="font-semibold">Fieldwork</a>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {links.map((l, i) => (
            <a key={l} href="#" aria-current={i === 0 ? "page" : undefined} className={i === 0 ? "font-medium" : "text-muted-foreground transition-colors hover:text-foreground"}>
              {l}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <form role="search" className="relative hidden sm:block" onSubmit={(e) => e.preventDefault()}>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" aria-label="Search projects" placeholder="Search projects" className="w-56 pl-8" />
          </form>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="hit-area">
                <Bell />
              </Button>
            </TooltipTrigger>
            <TooltipContent>3 unread notifications</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="hit-area [--hit:40px] rounded-full transition-transform active:scale-[0.96] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="Account menu">
                <Avatar><AvatarFallback>CS</AvatarFallback></Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Chris Sutton</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User /> Profile <DropdownMenuShortcut>⇧P</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem><Settings /> Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive"><LogOut /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
