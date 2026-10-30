import { useState } from "react"
import { Archive, Copy, FolderPlus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { invoices, activity, statusVariant, type Project } from "@/data"
import { useProjects } from "@/store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

function ProjectMenu({ project, onRename }: { project: Project; onRename: (p: Project) => void }) {
  const { duplicate, remove } = useProjects()
  // Archive and Delete both take effect immediately and offer a real Undo that restores the card
  // in place, instead of a confirmation dialog in front of every action (interaction-contracts).
  const removeWithUndo = (verb: string) => {
    const undo = remove(project.id)
    toast(`${verb} ${project.name}`, { action: { label: "Undo", onClick: undo } })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${project.name}`}><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onRename(project)}><Pencil /> Rename…</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { duplicate(project.id); toast(`Duplicated ${project.name}`) }}><Copy /> Duplicate</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => removeWithUndo("Archived")}><Archive /> Archive</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => removeWithUndo("Deleted")}><Trash2 /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RenameDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const { rename } = useProjects()
  const [draft, setDraft] = useState(project?.name ?? "")
  const [error, setError] = useState(false)
  return (
    <Dialog open={project !== null} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!project) return
            if (!draft.trim()) { setError(true); return }
            rename(project.id, draft.trim())
            toast.success(`Renamed to “${draft.trim()}”`)
            onClose()
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>The new name shows everywhere this project appears, including client views.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="rename-input">Project name</Label>
            <Input id="rename-input" value={draft} autoComplete="off" aria-invalid={error} aria-describedby={error ? "rename-error" : undefined}
              onChange={(e) => { setDraft(e.target.value); setError(false) }} onFocus={(e) => e.currentTarget.select()} />
            {error && <p id="rename-error" className="text-destructive text-sm">Enter a project name.</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Save name</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const remindable = (status: string) => status === "Sent" || status === "Overdue"

export function Workspace() {
  const { projects } = useProjects()
  const [renaming, setRenaming] = useState<Project | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const toggle = (n: string) => setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]))
  const allSelected = selected.length === invoices.length
  const eligible = selected.filter((n) => remindable(invoices.find((i) => i.number === n)!.status))
  const skipped = selected.length - eligible.length

  function sendReminders() {
    const r = `${eligible.length} reminder${eligible.length === 1 ? "" : "s"}`
    toast.success(`Sent ${r}`, skipped ? { description: `Skipped ${skipped} paid or draft invoice${skipped === 1 ? "" : "s"}.` } : undefined)
    setSelected([])
  }

  return (
    <section id="workspace" aria-labelledby="workspace-heading">
      <h2 id="workspace-heading" className="sr-only">Workspace</h2>
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projects <span className="text-muted-foreground tabular-nums">{projects.length}</span></TabsTrigger>
          <TabsTrigger value="invoices">Invoices <span className="text-muted-foreground tabular-nums">{invoices.length}</span></TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          {projects.length === 0 ? (
            <Card className="items-center py-10 text-center">
              <FolderPlus aria-hidden className="size-8 text-muted-foreground" />
              <div>
                <p className="font-medium">No projects yet</p>
                <p className="text-muted-foreground text-sm">Use New project above, or undo the last change from its notification.</p>
              </div>
            </Card>
          ) : (
            <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <li key={p.id} className="grid" style={{ viewTransitionName: `project-${p.id}` }}>
                  <Card className="gap-4">
                    <CardHeader>
                      <CardTitle>{p.name}</CardTitle>
                      <CardDescription>{p.client}</CardDescription>
                      <CardAction><ProjectMenu project={p} onRename={setRenaming} /></CardAction>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                        <span className="text-muted-foreground">{p.due === "—" ? "No due date" : p.status === "Done" ? `Finished ${p.due}` : `Due ${p.due}`}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={p.progress} aria-label={`${p.name} progress`} />
                        <span className="w-9 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{p.progress}%</span>
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      <ul aria-label={`Team: ${p.team.join(", ")}`} className="flex -space-x-2">
                        {p.team.map((t) => (
                          <li key={t} aria-hidden><Avatar className="border-2 border-card"><AvatarFallback>{t}</AvatarFallback></Avatar></li>
                        ))}
                      </ul>
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          )}
          <RenameDialog key={renaming?.id ?? "none"} project={renaming} onClose={() => setRenaming(null)} />
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="gap-0 py-2">
            <CardContent className="px-2">
              {/* The bulk bar is always present so the action is discoverable and the table never jumps. */}
              <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 px-2 text-sm" aria-live="polite">
                <span className={selected.length ? "" : "text-muted-foreground"}>
                  {selected.length ? `${selected.length} selected` : "Select invoices to send payment reminders"}
                </span>
                {selected.length > 0 && (
                  <>
                    <Button size="sm" variant="outline" onClick={sendReminders} disabled={eligible.length === 0}>
                      Send {eligible.length > 0 ? eligible.length : ""} reminder{eligible.length === 1 ? "" : "s"}
                    </Button>
                    {skipped > 0 && <span className="text-muted-foreground">Paid and draft invoices are skipped.</span>}
                    <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelected([])}>Clear</Button>
                  </>
                )}
              </div>
              <Table>
                <caption className="sr-only">Invoices, newest first</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox
                        checked={allSelected ? true : selected.length ? "indeterminate" : false}
                        onCheckedChange={() => setSelected(allSelected ? [] : invoices.map((i) => i.number))}
                        aria-label="Select all invoices"
                      />
                    </TableHead>
                    <TableHead scope="col">Invoice</TableHead>
                    <TableHead scope="col">Client</TableHead>
                    <TableHead scope="col">Issued</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col" className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.number} data-state={selected.includes(inv.number) ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox checked={selected.includes(inv.number)} onCheckedChange={() => toggle(inv.number)} aria-label={`Select ${inv.number}`} />
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">{inv.number}</TableCell>
                      <TableCell>{inv.client}</TableCell>
                      <TableCell className={inv.issued === "—" ? "text-muted-foreground" : ""}>{inv.issued === "—" ? "Not sent" : inv.issued}</TableCell>
                      <TableCell><Badge variant={statusVariant[inv.status]}>{inv.status}</Badge></TableCell>
                      <TableCell className="text-right tabular-nums">{money(inv.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent>
              <ol className="grid gap-4">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Avatar aria-hidden><AvatarFallback>{a.initials}</AvatarFallback></Avatar>
                    <div className="text-sm">
                      <p><span className="font-medium">{a.who}</span> {a.what}</p>
                      <p className="text-muted-foreground text-xs"><time>{a.when}</time></p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}
