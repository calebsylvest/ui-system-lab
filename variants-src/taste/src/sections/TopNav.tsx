import { Bell, LogOut, Menu, Search, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PersonAvatar } from "@/components/person"
import { Mark, NavList, WorkspaceSwitcher } from "@/sections/Sidebar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TopNav() {
  return (
    <header className="bg-frame sticky top-0 z-40">
      <div className="flex h-12 items-center gap-2 px-2 sm:px-4 lg:px-0">
        {/* Phone and tablet: the frame folds into this bar; the nav opens as a full-screen sheet. */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden"><Menu /></Button>
          </DialogTrigger>
          <DialogContent className="top-0 left-0 h-dvh max-w-none translate-x-0 translate-y-0 content-start rounded-none border-0 p-4 sm:max-w-none data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100">
            <DialogTitle className="sr-only">Menu</DialogTitle>
            <div className="pr-10"><WorkspaceSwitcher /></div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search projects" aria-label="Search projects" className="pl-9" />
            </div>
            <NavList className="[&_a]:h-11 [&_a]:text-base" />
          </DialogContent>
        </Dialog>
        <a href="#" className="flex items-center gap-2 font-semibold lg:hidden"><Mark /> Fieldwork</a>
        <div className="relative hidden sm:block lg:ml-0 sm:ml-4">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects" aria-label="Search projects" className="h-8 w-72 pl-8" />
        </div>
        <div className="ml-auto flex items-center gap-1 lg:pr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications, 3 unread">
                <Bell />
              </Button>
            </TooltipTrigger>
            <TooltipContent>3 unread notifications</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" aria-label="Account menu">
                <PersonAvatar initials="CS" className="size-7" />
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
