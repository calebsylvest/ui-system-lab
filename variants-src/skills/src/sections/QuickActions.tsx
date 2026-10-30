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
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

const statuses = ["On track", "At risk", "Paused", "Done"]

// better-writing: build strings whole, format lists and plurals through Intl
const plural = new Intl.PluralRules("en-US")
const list = new Intl.ListFormat("en-US", { style: "long", type: "conjunction" })
const statusCount = (n: number) => (plural.select(n) === "one" ? `${n} status selected` : `${n} statuses selected`)
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

// Round-2 section: overlays. A side panel, a popover with a form, a searchable picker and a ⌘K menu.
export function QuickActions() {
  const [filters, setFilters] = useState<string[]>(["On track", "At risk"])
  const [assignee, setAssignee] = useState("MR")
  const [pickOpen, setPickOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [peopleQuery, setPeopleQuery] = useState("")
  const [cmdQuery, setCmdQuery] = useState("")

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
                <SheetDescription className="tabular-nums">Hollis & Pine · due Nov&nbsp;14 · 64% complete</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-4">
                <div className="grid gap-2">
                  <Label htmlFor="sheet-name">Project name</Label>
                  <Input id="sheet-name" name="project-name" autoComplete="off" defaultValue="Spring catalog redesign" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sheet-budget">Budget (hours)</Label>
                  {/* Same treatment as the round-1 hourly rate: text + inputmode, not a spinner field */}
                  <Input id="sheet-budget" name="budget-hours" type="text" inputMode="decimal" autoComplete="off" className="tabular-nums" defaultValue={120} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sheet-notes">Notes</Label>
                  <Textarea id="sheet-notes" name="notes" defaultValue="Client wants two cover options. Final files due a week before print." />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild><Button onClick={() => toast.success("Project details saved")}>Save changes</Button></SheetClose>
                <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" data-lab="popover">
                {/* Name reads "Filter: 2 statuses selected"; the bare count alone meant nothing to a screen reader */}
                <Filter /> Filter<span className="sr-only">: {statusCount(filters.length)}</span>{" "}
                <span className="text-muted-foreground tabular-nums" aria-hidden="true">{filters.length}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="grid gap-4">
              {/* A checkbox group named by its heading (1.3.1) */}
              <div role="group" aria-labelledby="filter-heading" aria-describedby="filter-hint" className="grid gap-3">
                <div className="grid gap-0.5">
                  <p id="filter-heading" className="text-sm font-medium">Show projects that are</p>
                  <p id="filter-hint" className="text-muted-foreground text-xs">Applies to the project grid.</p>
                </div>
                <div className="grid gap-1">
                  {statuses.map((s) => (
                    // Wrapping label: no dead zone between box and text, and a taller row to hit
                    <Label key={s} className="min-h-8 font-normal">
                      <Checkbox checked={filters.includes(s)} onCheckedChange={() => toggleFilter(s)} />
                      {s}
                    </Label>
                  ))}
                </div>
              </div>
              <div className="flex justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={() => setFilters([])}>Clear</Button>
                <Button
                  size="sm"
                  onClick={() =>
                    filters.length
                      ? toast("Status filter applied", { description: `Showing projects that are ${list.format(filters)}.` })
                      : toast("Status filter cleared", { description: "Showing projects in every status." })
                  }
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={pickOpen} onOpenChange={(o) => { setPickOpen(o); if (!o) setPeopleQuery("") }}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={pickOpen} aria-haspopup="listbox" data-lab="combobox" className="w-52 max-w-full justify-between">
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar className="size-5" aria-hidden="true"><AvatarFallback className="text-[9px]">{person.id}</AvatarFallback></Avatar>
                  {/* The button's name says what it picks, not the avatar initials */}
                  <span className="sr-only">Assignee: </span>
                  <span className="truncate">{person.name}</span>
                </span>
                <ChevronsUpDown className="text-muted-foreground" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            {/* Concentric: items (radius-sm) inset 4px + 1px border → outer radius-sm + 5px, as the round-1 menus */}
            <PopoverContent className="w-52 rounded-[calc(var(--radius-sm)+5px)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search people" aria-label="Search people" value={peopleQuery} onValueChange={setPeopleQuery} />
                <CommandList>
                  <CommandEmpty>No one named “{peopleQuery}”. Try a first or last name.</CommandEmpty>
                  <CommandGroup>
                    {people.map((p) => (
                      <CommandItem key={p.id} value={p.name} onSelect={() => { setAssignee(p.id); setPickOpen(false); setPeopleQuery("") }}>
                        <Avatar className="size-5" aria-hidden="true"><AvatarFallback className="text-[9px]">{p.id}</AvatarFallback></Avatar>
                        <span className="min-w-0 flex-1 truncate">{p.name}</span>
                        {/* The check is the visible cue for the current assignee; the sr-only text is its non-visual twin */}
                        <Check aria-hidden="true" className={p.id === assignee ? "opacity-100" : "opacity-0"} />
                        {p.id === assignee && <span className="sr-only">, current assignee</span>}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button variant="outline" data-lab="command" aria-keyshortcuts="Meta+K Control+K" onClick={() => setCmdOpen(true)}>
            <CommandIcon /> Command menu <kbd className="text-muted-foreground font-sans text-xs">{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm text-pretty">
          Assigned to {person.name} ({person.role}). {filters.length ? `Showing projects that are ${list.format(filters)}.` : "Showing projects in every status."}
        </p>

        <CommandDialog open={cmdOpen} onOpenChange={(o) => { setCmdOpen(o); if (!o) setCmdQuery("") }}>
          <CommandInput placeholder="Type a command or search" aria-label="Search commands" value={cmdQuery} onValueChange={setCmdQuery} />
          <CommandList>
            <CommandEmpty>No commands match “{cmdQuery}”. Try a project name or “invoice”.</CommandEmpty>
            {commands.map((g) => (
              <CommandGroup key={g.group} heading={g.group}>
                {/* The ⌘N hint was removed: no ⌘N handler exists, and in browsers ⌘N opens a new window */}
                {g.items.map((c) => (
                  <CommandItem key={c} onSelect={() => { setCmdOpen(false); setCmdQuery(""); toast(c) }}>
                    {c}
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
