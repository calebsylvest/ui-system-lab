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
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { isApplePlatform, modKey } from "@/lib/platform"

const statuses = ["On track", "At risk", "Paused", "Done"]
const savedProject = { name: "Spring catalog redesign", budget: "120", notes: "Client wants two cover options. Final files due a week before print." }

// Round-2 section: overlays. A side panel, a popover with a form, a searchable picker and a ⌘K menu.
export function QuickActions() {
  const [filters, setFilters] = useState<string[]>(["On track", "At risk"])
  const [assignee, setAssignee] = useState("MR")
  const [pickOpen, setPickOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  // The sheet keeps a draft separate from the saved project. Closing with Escape or the backdrop keeps the
  // draft; only Cancel discards it (surface-details › Preserve entered data by default).
  const [project, setProject] = useState(savedProject)
  const [draft, setDraft] = useState(savedProject)
  const dirty = draft.name !== project.name || draft.budget !== project.budget || draft.notes !== project.notes

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCmdOpen((o) => !o) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const person = people.find((p) => p.id === assignee)!
  const toggleFilter = (s: string) => setFilters((f) => (f.includes(s) ? f.filter((x) => x !== s) : [...f, s]))

  function saveProject(e: React.FormEvent) {
    e.preventDefault()
    setProject(draft)
    setSheetOpen(false)
    toast.success(`Saved changes to ${draft.name.trim() || "the project"}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Side panel, popover, searchable picker and command menu.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" data-lab="sheet"><PanelRight /> Project details</Button>
            </SheetTrigger>
            <SheetContent>
              {/* A real form: Enter in a field saves, and the footer buttons are part of it. */}
              <form onSubmit={saveProject} className="flex min-h-0 flex-1 flex-col gap-4">
                <SheetHeader>
                  <SheetTitle>{project.name}</SheetTitle>
                  <SheetDescription>Hollis & Pine · due Nov 14 · <span className="tabular-nums">64%</span> complete</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 overflow-y-auto overscroll-contain px-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sheet-name">Project name</Label>
                    <Input id="sheet-name" required autoComplete="off" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sheet-budget">Budget (hours)</Label>
                    <Input id="sheet-budget" type="number" inputMode="numeric" min={0} className="tabular-nums" value={draft.budget} onChange={(e) => setDraft({ ...draft, budget: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sheet-notes">Notes</Label>
                    <Textarea id="sheet-notes" spellCheck value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                  </div>
                  {dirty && <p className="text-muted-foreground text-xs">Unsaved changes. They stay here until you save or cancel.</p>}
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={() => { setDraft(project); setSheetOpen(false) }}>Cancel</Button>
                  <Button type="submit">Save changes</Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" data-lab="popover">
                <Filter /> Filter
                <span className="bg-muted text-muted-foreground -mr-1 min-w-5 rounded-sm px-1 text-xs tabular-nums">{filters.length}</span>
                <span className="sr-only"> active</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="grid gap-3 p-3">
              {/* Checkboxes apply immediately (surface-details › Toggles take effect immediately),
                  so the footer closes the popover instead of asking for a separate Apply. */}
              <fieldset className="grid gap-0.5">
                <legend className="px-1 text-sm font-medium">Show projects that are</legend>
                <p className="text-muted-foreground mb-1.5 px-1 text-xs">Changes apply to the project grid right away.</p>
                {statuses.map((s) => (
                  // Whole row is the label, rows touch, so there's no dead zone (radius 10 − 3 padding ≈ 6).
                  <Label key={s} htmlFor={`f-${s}`} className="hover:bg-accent flex cursor-pointer items-center gap-2.5 rounded-sm px-1.5 py-2 font-normal">
                    <Checkbox id={`f-${s}`} checked={filters.includes(s)} onCheckedChange={() => toggleFilter(s)} />
                    {s}
                  </Label>
                ))}
              </fieldset>
              <div className="flex justify-between">
                <Button variant="ghost" size="sm" disabled={filters.length === 0} onClick={() => setFilters([])}>Clear</Button>
                <Button size="sm" onClick={() => setFilterOpen(false)}>Done</Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={pickOpen} onOpenChange={setPickOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={pickOpen} aria-haspopup="listbox" data-lab="combobox" className="w-52 justify-between">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="sr-only">Assignee: </span>
                  <Avatar className="size-5" aria-hidden><AvatarFallback className="text-[9px]">{person.id}</AvatarFallback></Avatar>
                  <span className="truncate">{person.name}</span>
                </span>
                <ChevronsUpDown className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            {/* Same width as the trigger; radius and padding come from the popover so items stay concentric. */}
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
              <Command loop label="Assignee">
                <CommandInput placeholder="Search people" />
                <CommandList>
                  <CommandEmpty>No one matches that name.</CommandEmpty>
                  <CommandGroup>
                    {people.map((p) => (
                      <CommandItem key={p.id} value={p.name} keywords={[p.role]} onSelect={() => { setAssignee(p.id); setPickOpen(false) }}>
                        <Avatar className="size-5" aria-hidden><AvatarFallback className="text-[9px]">{p.id}</AvatarFallback></Avatar>
                        <span className="flex-1 truncate">{p.name}</span>
                        <Check aria-hidden className={p.id === assignee ? "text-foreground opacity-100" : "opacity-0"} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button variant="outline" data-lab="command" aria-keyshortcuts={isApplePlatform ? "Meta+K" : "Control+K"} onClick={() => setCmdOpen(true)}>
            <CommandIcon /> Command menu
            <kbd aria-hidden className="bg-muted text-muted-foreground -mr-1 rounded-sm px-1.5 font-sans text-xs">{modKey}K</kbd>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm" aria-live="polite">Assigned to {person.name} ({person.role}). Filtering by {filters.length ? filters.join(", ") : "nothing"}.</p>

        <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
          <CommandInput placeholder="Type a command or search" />
          <CommandList>
            <CommandEmpty>No commands match. Try a project name or “invoice”.</CommandEmpty>
            {commands.map((g) => (
              <CommandGroup key={g.group} heading={g.group}>
                {g.items.map((c, i) => (
                  <CommandItem key={c} onSelect={() => { setCmdOpen(false); toast(c) }}>
                    {c}
                    {g.group === "Projects" && i === 0 && <CommandShortcut>{modKey}N</CommandShortcut>}
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
