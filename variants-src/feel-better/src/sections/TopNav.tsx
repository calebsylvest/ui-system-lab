import { Bell, LogOut, Search, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const links = ["Projects", "Clients", "Time", "Invoices", "Reports"]

export function TopNav() {
  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <a href="#" className="relative font-semibold after:absolute after:-inset-x-2 after:top-1/2 after:h-10 after:-translate-y-1/2">Fieldwork</a>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {links.map((l, i) => (
            <a key={l} href="#" className={cn("relative after:absolute after:-inset-x-2 after:top-1/2 after:h-10 after:-translate-y-1/2", i === 0 ? "font-medium" : "text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground")}>
              {l}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search strokeWidth={1.5} className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search projects" className="w-56 pl-8" />
          </div>
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
              <button className="relative rounded-full transition-transform duration-150 ease-out motion-safe:active:scale-[0.96] after:absolute after:top-1/2 after:left-1/2 after:size-10 after:-translate-1/2" aria-label="Account menu">
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
