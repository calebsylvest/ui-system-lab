import { useMemo, useState } from "react"
import { Command as CommandIcon, Filter, PanelRight } from "lucide-react"
import { toast } from "sonner"
import { commands, people } from "@/data-extra"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckboxGroup, CheckboxItem } from "@/components/ui/checkbox-group"
import { InputField, InputGroup } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import {
  CommandMenu,
  CommandMenuDialog,
  CommandMenuEmpty,
  CommandMenuInput,
  CommandMenuList,
  CommandMenuShortcut,
  type CommandMenuItemData,
} from "@/components/ui/command-menu"
import type { IconComponent, IconComponentProps } from "@/lib/icon-context"
import { fontWeights } from "@/lib/font-weight"

const statuses = ["On track", "At risk", "Paused", "Done"]

// Initials in the combobox's icon slot, so each row and the field lead with the person's avatar.
const avatarIcons: Record<string, IconComponent> = Object.fromEntries(
  people.map((p) => [
    p.id,
    ({ size = 16 }: IconComponentProps) => (
      <Avatar className="shrink-0" style={{ width: size + 4, height: size + 4 }}>
        <AvatarFallback className="text-[length:var(--fs-micro,11px)] leading-none">{p.id}</AvatarFallback>
      </Avatar>
    ),
  ])
)

// Round-2 section: overlays. A side panel, a popover with a form, a searchable picker and a ⌘K menu.
export function QuickActions() {
  const [filters, setFilters] = useState<string[]>(["On track", "At risk"])
  const [assignee, setAssignee] = useState("MR")
  const [cmdOpen, setCmdOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [projectName, setProjectName] = useState("Spring catalog redesign")
  const [budget, setBudget] = useState("120")

  // ⌘K / Ctrl+K is bound by CommandMenuDialog's own `shortcut` (default "mod+k").
  const items = useMemo<CommandMenuItemData[]>(
    () =>
      commands.flatMap((g) =>
        g.items.map((c, i) => ({
          value: `${g.group}:${c}`,
          label: c,
          group: g.group,
          shortcut: g.group === "Projects" && i === 0 ? "mod+n" : undefined,
        }))
      ),
    []
  )

  const person = people.find((p) => p.id === assignee)!
  const personItems = people.map((p) => ({ value: p.id, label: p.name }))
  const toggleFilter = (s: string) => setFilters((f) => (f.includes(s) ? f.filter((x) => x !== s) : [...f, s]))
  const checked = new Set(statuses.flatMap((s, i) => (filters.includes(s) ? [i] : [])))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Side panel, popover, searchable picker and command menu.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="tertiary" leadingIcon={PanelRight} data-lab="sheet">Project details</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Spring catalog redesign</SheetTitle>
                <SheetDescription>Hollis & Pine · due Nov 14 · 64% complete</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4">
                <InputGroup>
                  <InputField index={0} id="sheet-name" label="Project name" value={projectName} onChange={setProjectName} />
                  <InputField index={1} id="sheet-budget" type="number" label="Budget (hours)" value={budget} onChange={setBudget} />
                </InputGroup>
                <div className="grid gap-2">
                  <Label htmlFor="sheet-notes">Notes</Label>
                  <Textarea id="sheet-notes" defaultValue="Client wants two cover options. Final files due a week before print." />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild><Button variant="tertiary">Cancel</Button></SheetClose>
                <SheetClose asChild><Button onClick={() => toast.success("Project updated")}>Save changes</Button></SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="tertiary" leadingIcon={Filter} active={filterOpen} data-lab="popover">
                Filter <span className="text-muted-foreground tabular-nums">{filters.length}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="grid w-64 gap-3">
              <div className="grid gap-0.5 px-1">
                <p className="text-[length:var(--fs-body,13px)] leading-[var(--lh-body,20px)]" style={{ fontVariationSettings: fontWeights.semibold }}>Show projects that are</p>
                <p className="text-muted-foreground text-[length:var(--fs-caption,12px)] leading-[var(--lh-caption,16px)]">Applies to the project grid.</p>
              </div>
              <CheckboxGroup checkedIndices={checked} aria-label="Project status">
                {statuses.map((s, i) => (
                  <CheckboxItem key={s} index={i} label={s} checked={filters.includes(s)} onToggle={() => toggleFilter(s)} />
                ))}
              </CheckboxGroup>
              <div className="flex justify-between">
                <Button variant="ghost" size="compact" onClick={() => setFilters([])}>Clear</Button>
                <Button size="compact" onClick={() => { setFilterOpen(false); toast(`Showing ${filters.length} statuses`) }}>Apply</Button>
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-56">
            <Combobox items={personItems} value={assignee} onValueChange={(v) => v && setAssignee(v)}>
              <ComboboxInput data-lab="combobox" aria-label="Assignee" icon={avatarIcons[assignee]} placeholder="Search people" />
              <ComboboxContent>
                <ComboboxEmpty>No one by that name.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => {
                    const it = item as { value: string; label: string }
                    return <ComboboxItem key={it.value} value={it.value} icon={avatarIcons[it.value]}>{it.label}</ComboboxItem>
                  }}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <Button variant="tertiary" leadingIcon={CommandIcon} data-lab="command" onClick={() => setCmdOpen(true)}>
            Command menu <CommandMenuShortcut keys="mod+k" />
          </Button>
        </div>
        <p className="text-muted-foreground text-[length:var(--fs-body,13px)] leading-[var(--lh-body,20px)]">
          Assigned to {person.name} ({person.role}). Filtering by {filters.length ? filters.join(", ") : "nothing"}.
        </p>

        <CommandMenuDialog open={cmdOpen} onOpenChange={setCmdOpen}>
          <CommandMenu items={items} onSelect={(item) => toast(item.label)}>
            <CommandMenuInput placeholder="Type a command or search" />
            <CommandMenuList>
              <CommandMenuEmpty>No results found.</CommandMenuEmpty>
            </CommandMenuList>
          </CommandMenu>
        </CommandMenuDialog>
      </CardContent>
    </Card>
  )
}
