import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, Command as CommandIcon, Filter, PanelRight } from "lucide-react"
import { toast } from "sonner"
import { commands, people } from "@/data-extra"
import { projects, statusVariant } from "@/data"
import { PersonAvatar } from "@/components/person"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"

function listOf(xs: string[]) {
  return xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} or ${xs[xs.length - 1]}`
}

const statuses = ["On track", "At risk", "Paused", "Done"] as const
const detail = projects.find((p) => p.id === "p1")!

// Round-2 section: overlays. A side panel, a popover with a form, a searchable picker and a ⌘K menu.
// taste-skill: four 32px outlined controls in one row (8.3); the people as their tinted initials;
// statuses as the same pale pills the project grid uses (7.6); the current choices in a key-value
// well (7.9) instead of a sentence; the project's progress in the one data hue inside the panel.
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
                <SheetTitle>{detail.name}</SheetTitle>
                <SheetDescription>{detail.client}, due {detail.due}. {detail.progress}% complete.</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 overflow-y-auto px-6 pb-6">
                {/* The project's one figure, with the brand hue on its data element (6.4). */}
                <div className="bg-muted grid gap-2 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant={statusVariant[detail.status]}>{detail.status}</Badge>
                    <span><span className="font-medium">{detail.progress}%</span> <span className="text-muted-foreground">complete</span></span>
                  </div>
                  <Progress value={detail.progress} aria-label="Progress" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due <span className="text-foreground">{detail.due}</span></span>
                    <span className="flex -space-x-1.5">
                      {detail.team.map((t) => <PersonAvatar key={t} initials={t} className="ring-muted size-6 ring-2" />)}
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sheet-name">Project name</Label>
                  <Input id="sheet-name" defaultValue="Spring catalog redesign" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sheet-budget">Budget</Label>
                  {/* The unit beside the figure, as in round 1's rate field. */}
                  <div className="relative">
                    <Input id="sheet-budget" type="number" defaultValue={120} className="pr-16 text-right" aria-describedby="sheet-budget-unit" />
                    <span id="sheet-budget-unit" className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">hours</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sheet-notes">Notes</Label>
                  <Textarea id="sheet-notes" defaultValue="Client wants two cover options. Final files due a week before print." />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild><Button onClick={() => toast.success(`${detail.name} saved`)}>Save changes</Button></SheetClose>
                <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" data-lab="popover"><Filter /> Filter <span className="text-muted-foreground">{filters.length}</span></Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="grid w-64 gap-3 p-0">
              <div className="px-4 pt-4">
                <p className="text-sm font-medium">Show projects that are</p>
                <p className="text-muted-foreground text-xs">Applies to the project grid.</p>
              </div>
              {/* Each status as the pill the grid shows, with its project count (counts from rows, 2.1). */}
              <div className="grid px-2" role="group" aria-label="Statuses">
                {statuses.map((s) => (
                  <label key={s} htmlFor={`f-${s}`} className="hover:bg-accent flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2">
                    <Checkbox id={`f-${s}`} checked={filters.includes(s)} onCheckedChange={() => toggleFilter(s)} />
                    <Badge variant={statusVariant[s]}>{s}</Badge>
                    <span className="text-muted-foreground ml-auto text-sm">{projects.filter((p) => p.status === s).length}</span>
                  </label>
                ))}
              </div>
              <div className="border-rule flex justify-between border-t px-4 py-3">
                <Button variant="ghost" size="sm" onClick={() => setFilters([])} disabled={!filters.length}>Clear</Button>
                <Button size="sm" onClick={() => toast(filters.length ? `Showing projects that are ${listOf(filters)}` : "No status filter. Showing every project.")}>Apply</Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={pickOpen} onOpenChange={setPickOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={pickOpen} data-lab="combobox" className="w-52 justify-between">
                <span className="flex min-w-0 items-center gap-2">
                  <PersonAvatar initials={person.id} className="size-5 [&_[data-slot=avatar-fallback]]:text-[11px]" />
                  <span className="truncate">{person.name}</span>
                </span>
                <ChevronsUpDown className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search people" />
                <CommandList>
                  <CommandEmpty>No one by that name.</CommandEmpty>
                  <CommandGroup>
                    {people.map((p) => (
                      <CommandItem key={p.id} value={p.name} onSelect={() => { setAssignee(p.id); setPickOpen(false) }}>
                        <PersonAvatar initials={p.id} className="size-6" />
                        <span className="min-w-0 flex-1 truncate">{p.name}</span>
                        <span className="text-muted-foreground text-xs">{p.role}</span>
                        <Check className={"text-foreground " + (p.id === assignee ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button variant="outline" data-lab="command" onClick={() => setCmdOpen(true)}>
            <CommandIcon /> Command menu <kbd className="text-muted-foreground font-sans text-xs" aria-hidden="true">⌘K</kbd>
          </Button>
        </div>
        {/* Current choices as a key-value well: label left, value right, 32px rows (7.9). */}
        <dl className="bg-muted grid rounded-lg px-4 py-1 text-sm" aria-live="polite">
          <div className="flex min-h-8 items-center justify-between gap-4">
            <dt className="text-muted-foreground">Assigned to</dt>
            <dd>{person.name} <span className="text-muted-foreground">({person.role})</span></dd>
          </div>
          <div className="border-rule flex min-h-8 items-center justify-between gap-4 border-t">
            <dt className="text-muted-foreground">Filtering by</dt>
            <dd className="text-right">{filters.length ? filters.join(", ") : <span className="text-muted-foreground">Nothing</span>}</dd>
          </div>
        </dl>

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
