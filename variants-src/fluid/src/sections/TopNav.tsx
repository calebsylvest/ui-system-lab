import { Bell, LogOut, Search, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip } from "@/components/ui/tooltip"
import { DropdownContent, DropdownLabel, DropdownMenu, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown"
import { MenuItem } from "@/components/ui/menu-item"

const links = ["Projects", "Clients", "Time", "Invoices", "Reports"]

export function TopNav() {
  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <a href="#" className="font-semibold">Fieldwork</a>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {links.map((l, i) => (
            <a key={l} href="#" className={i === 0 ? "font-medium" : "text-muted-foreground hover:text-foreground"}>
              {l}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search projects" className="w-56 pl-8" />
          </div>
          <Tooltip content="3 unread notifications">
            <Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button>
          </Tooltip>
          <DropdownMenu>
            <DropdownTrigger render={
              <button className="rounded-full" aria-label="Account menu">
                <Avatar><AvatarFallback>CS</AvatarFallback></Avatar>
              </button>
            } />
            <DropdownContent align="end">
              <DropdownLabel>Chris Sutton</DropdownLabel>
              <DropdownSeparator />
              <MenuItem index={0} icon={User} label="Profile" />
              <MenuItem index={1} icon={Settings} label="Settings" />
              <DropdownSeparator />
              <MenuItem index={2} icon={LogOut} label="Sign out" />
            </DropdownContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
