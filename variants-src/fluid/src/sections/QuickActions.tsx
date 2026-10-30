import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, Command as CommandIcon, Filter, PanelRight } from "lucide-react"
import { toast } from "sonner"
import { commands, people } from "@/data-extra"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"

const statuses = ["On track", "At risk", "Paused", "Done"]

// Round-2 section: overlays. A side panel, a popover with a form, a searchable picker and a ⌘K menu.
export function QuickActions() {
  const [filters, setFilters] = useState<string[]>(["On track", "At risk"])
  const [assignee, setAssignee] = useState("MR")
  const [pickOpen, setPickOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCmdOpen((o) => !o) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const person = people.find((p) => p.id === assignee)!
  const toggleFilter = (s: string) => setFilters((f) => (f.includes(s) ? f.filter((x) => x !== s) : [...f, s]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Side panel, popover, searchable picker and command menu.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" data-lab="sheet"><PanelRight /> Project details</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Spring catalog redesign</SheetTitle>
                <SheetDescription>Hollis & Pine · due Nov 14 · 64% complete</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-4">
                <div className="grid gap-2">
                  <Label htmlFor="sheet-name">Project name</Label>
                  <Input id="sheet-name" defaultValue="Spring catalog redesign" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sheet-budget">Budget (hours)</Label>
                  <Input id="sheet-budget" type="number" defaultValue={120} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sheet-notes">Notes</Label>
                  <Textarea id="sheet-notes" defaultValue="Client wants two cover options. Final files due a week before print." />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild><Button onClick={() => toast.success("Project updated")}>Save changes</Button></SheetClose>
                <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" data-lab="popover"><Filter /> Filter <span className="text-muted-foreground">{filters.length}</span></Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="grid gap-3">
              <div>
                <p className="text-sm font-medium">Show projects that are</p>
                <p className="text-muted-foreground text-xs">Applies to the project grid.</p>
              </div>
              <div className="grid gap-2">
                {statuses.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <Checkbox id={`f-${s}`} checked={filters.includes(s)} onCheckedChange={() => toggleFilter(s)} />
                    <Label htmlFor={`f-${s}`}>{s}</Label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => setFilters([])}>Clear</Button>
                <Button size="sm" onClick={() => toast(`Showing ${filters.length} statuses`)}>Apply</Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={pickOpen} onOpenChange={setPickOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={pickOpen} data-lab="combobox" className="w-52 justify-between">
                <span className="flex items-center gap-2">
                  <Avatar className="size-5"><AvatarFallback className="text-[9px]">{person.id}</AvatarFallback></Avatar>
                  {person.name}
                </span>
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search people" />
                <CommandList>
                  <CommandEmpty>No one by that name.</CommandEmpty>
                  <CommandGroup>
                    {people.map((p) => (
                      <CommandItem key={p.id} value={p.name} onSelect={() => { setAssignee(p.id); setPickOpen(false) }}>
                        <Avatar className="size-5"><AvatarFallback className="text-[9px]">{p.id}</AvatarFallback></Avatar>
                        <span className="flex-1">{p.name}</span>
                        <Check className={p.id === assignee ? "opacity-100" : "opacity-0"} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button variant="outline" data-lab="command" onClick={() => setCmdOpen(true)}>
            <CommandIcon /> Command menu <span className="text-muted-foreground text-xs">⌘K</span>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">Assigned to {person.name} ({person.role}). Filtering by {filters.length ? filters.join(", ") : "nothing"}.</p>

        <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
          <CommandInput placeholder="Type a command or search" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {commands.map((g) => (
              <CommandGroup key={g.group} heading={g.group}>
                {g.items.map((c, i) => (
                  <CommandItem key={c} onSelect={() => { setCmdOpen(false); toast(c) }}>
                    {c}
                    {g.group === "Projects" && i === 0 && <CommandShortcut>⌘N</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </CommandDialog>
      </CardContent>
    </Card>
  )
}
