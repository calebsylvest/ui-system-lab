import { useEffect, useRef, useState, type FormEvent } from "react"
import { Check, ChevronsUpDown, Command as CommandIcon, Filter, PanelRight } from "lucide-react"
import { toast } from "sonner"
import { commands, people } from "@/data-extra"
import { useProjects } from "@/store"
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
const SHEET_PROJECT = "p1"
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)

function listStatuses(s: string[]) {
  if (s.length === 0 || s.length === statuses.length) return "every status"
  if (s.length === 1) return s[0]
  return `${s.slice(0, -1).join(", ")} or ${s[s.length - 1]}`
}

// Overlays with explicit contracts (interaction-contracts):
// - Side panel edits a draft. Save commits (the project name goes through the shared store, so the card
//   in Workspace really changes); Cancel, Escape or the close button discard the draft.
// - Filter popover edits a draft too. Apply commits and closes; dismissing it discards.
// - Command menu items that have a real destination go there; ⌘N was removed because nothing binds it.
export function QuickActions() {
  const { projects, rename } = useProjects()
  const project = projects.find((p) => p.id === SHEET_PROJECT)

  const [details, setDetails] = useState({ name: "Spring catalog redesign", budget: "120", notes: "Client wants two cover options. Final files due a week before print." })
  const committedName = project?.name ?? details.name
  const [sheetOpen, setSheetOpen] = useState(false)
  const [draft, setDraft] = useState(details)
  const [nameError, setNameError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const [filters, setFilters] = useState<string[]>(["On track", "At risk"])
  const [filterDraft, setFilterDraft] = useState<string[]>(filters)
  const [filterOpen, setFilterOpen] = useState(false)

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

  function openSheet(open: boolean) {
    if (open) {
      setDraft({ ...details, name: committedName })
      setNameError(null)
    }
    setSheetOpen(open)
  }

  function saveSheet(e: FormEvent) {
    e.preventDefault()
    const name = draft.name.trim()
    if (!name) {
      setNameError("Give the project a name.")
      nameRef.current?.focus()
      return
    }
    if (project && name !== project.name) rename(project.id, name)
    setDetails({ ...draft, name })
    setSheetOpen(false)
    toast.success(`Saved “${name}”`)
  }

  function openFilter(open: boolean) {
    if (open) setFilterDraft(filters)
    setFilterOpen(open)
  }

  function applyFilter(e: FormEvent) {
    e.preventDefault()
    setFilters(filterDraft)
    setFilterOpen(false)
  }

  const toggleDraft = (s: string) => setFilterDraft((f) => (f.includes(s) ? f.filter((x) => x !== s) : [...f, s]))

  function runCommand(c: string) {
    setCmdOpen(false)
    if (c === "Open Spring catalog redesign") {
      // Wait for the menu's exit so its focus return doesn't land after the panel takes focus.
      window.setTimeout(() => openSheet(true), 220)
      return
    }
    if (c === "Settings") {
      window.setTimeout(() => {
        const el = document.getElementById("settings")
        el?.scrollIntoView({ block: "start" })
        document.getElementById("ws-name")?.focus({ preventScroll: true }) // same target as ⌘, in the top nav
      }, 220)
      return
    }
    toast(c)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Open a project, narrow the list, reassign work or jump anywhere.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Sheet open={sheetOpen} onOpenChange={openSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" data-lab="sheet"><PanelRight /> Project details</Button>
            </SheetTrigger>
            <SheetContent>
              <form onSubmit={saveSheet} className="flex h-full flex-col gap-4" noValidate>
                <SheetHeader>
                  <SheetTitle className="pr-8 text-pretty">{committedName}</SheetTitle>
                  <SheetDescription>
                    {project ? `${project.client} · due ${project.due} · ${project.progress}% complete` : "Hollis & Pine · due Nov 14 · 64% complete"}
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 px-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sheet-name">Project name</Label>
                    <Input
                      ref={nameRef}
                      id="sheet-name"
                      value={draft.name}
                      onChange={(e) => { setDraft({ ...draft, name: e.target.value }); setNameError(null) }}
                      aria-invalid={nameError ? true : undefined}
                      aria-describedby={nameError ? "sheet-name-error" : undefined}
                      autoComplete="off"
                    />
                    {nameError && <p id="sheet-name-error" className="text-destructive text-xs">{nameError}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sheet-budget">Budget</Label>
                    <div className="relative">
                      <Input
                        id="sheet-budget"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={draft.budget}
                        onChange={(e) => setDraft({ ...draft, budget: e.target.value })}
                        aria-describedby="sheet-budget-unit"
                        className="pr-14 tabular-nums"
                      />
                      <span id="sheet-budget-unit" className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">hours</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sheet-notes">Notes</Label>
                    <Textarea id="sheet-notes" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                  </div>
                </div>
                <SheetFooter className="sm:flex-row-reverse sm:justify-start">
                  <Button type="submit">Save changes</Button>
                  <SheetClose asChild><Button type="button" variant="ghost">Cancel</Button></SheetClose>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <Popover open={filterOpen} onOpenChange={openFilter}>
            <PopoverTrigger asChild>
              <Button variant="outline" data-lab="popover">
                <Filter /> Filter
                <span className="bg-muted text-muted-foreground rounded-sm px-1.5 text-xs tabular-nums">
                  {filters.length}<span className="sr-only"> {filters.length === 1 ? "status" : "statuses"}</span>
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <form onSubmit={applyFilter} className="grid gap-3">
                <fieldset className="grid gap-2">
                  <legend className="mb-2 text-sm font-medium">Show projects that are</legend>
                  {statuses.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <Checkbox id={`f-${s}`} checked={filterDraft.includes(s)} onCheckedChange={() => toggleDraft(s)} />
                      <Label htmlFor={`f-${s}`} className="font-normal">{s}</Label>
                    </div>
                  ))}
                </fieldset>
                <div className="flex justify-between">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFilterDraft([])} disabled={filterDraft.length === 0}>Clear</Button>
                  <Button type="submit" size="sm">Apply</Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>

          <Popover open={pickOpen} onOpenChange={setPickOpen}>
            <span id="assignee-label" className="sr-only">Assignee</span>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={pickOpen}
                aria-haspopup="listbox"
                aria-labelledby="assignee-label assignee-value"
                data-lab="combobox"
                className="w-56 justify-between"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar className="size-5"><AvatarFallback className="text-[9px]" aria-hidden>{person.id}</AvatarFallback></Avatar>
                  <span id="assignee-value" className="truncate">{person.name}</span>
                </span>
                <ChevronsUpDown className="opacity-50" aria-hidden />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search people" aria-label="Search people" />
                <CommandList>
                  <CommandEmpty>No one by that name.</CommandEmpty>
                  <CommandGroup>
                    {people.map((p) => (
                      <CommandItem key={p.id} value={`${p.name} ${p.role}`} onSelect={() => { setAssignee(p.id); setPickOpen(false) }}>
                        <Avatar className="size-5"><AvatarFallback className="text-[9px]" aria-hidden>{p.id}</AvatarFallback></Avatar>
                        <span className="flex-1 truncate">{p.name}</span>
                        <span className="text-muted-foreground text-xs">{p.role}</span>
                        <Check className={p.id === assignee ? "opacity-100" : "opacity-0"} aria-hidden />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button variant="outline" data-lab="command" onClick={() => setCmdOpen(true)} aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}>
            <CommandIcon /> Command menu
            <kbd aria-hidden className="text-muted-foreground rounded border px-1.5 font-sans text-xs">{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          Assigned to {person.name}, {person.role.toLowerCase()}. Status filter: {listStatuses(filters)}.
        </p>

        <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen} title="Command menu" description="Search projects, invoice actions and pages.">
          <CommandInput placeholder="Type a command or search" aria-label="Search commands" />
          <CommandList>
            <CommandEmpty>Nothing matches. Try a project or page name.</CommandEmpty>
            {commands.map((g) => (
              <CommandGroup key={g.group} heading={g.group}>
                {g.items.map((c) => (
                  <CommandItem key={c} onSelect={() => runCommand(c)}>{c}</CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </CommandDialog>
      </CardContent>
    </Card>
  )
}
