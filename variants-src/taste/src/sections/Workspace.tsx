import { useState } from "react"
import { Archive, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { projects, invoices, activity, statusVariant } from "@/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PersonAvatar } from "@/components/person"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

function ProjectMenu({ name }: { name: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${name}`} className="-mt-1 -mr-2 text-muted-foreground"><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem><Pencil /> Rename</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast(`Duplicated ${name}`)}><Copy /> Duplicate</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast(`Archived ${name}`, { action: { label: "Undo", onClick: () => {} } })}><Archive /> Archive</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive"><Trash2 /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Workspace() {
  const [selected, setSelected] = useState<string[]>([])
  const toggle = (n: string) => setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]))

  return (
    <Tabs defaultValue="projects">
      <TabsList>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      {/* Peer objects: 3 across, equal widths, one 24px gap, no orphan (6 = 2 x 3). */}
      <TabsContent value="projects" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id} className="gap-4">
            <CardHeader>
              <CardTitle className="truncate">{p.name}</CardTitle>
              <CardDescription>{p.client}</CardDescription>
              <CardAction><ProjectMenu name={p.name} /></CardAction>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              <div className="flex items-center justify-between text-sm">
                <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                <span className="text-muted-foreground">
                  {p.due === "—" ? <>No due date</> : <>Due <span className="text-foreground">{p.due}</span></>}
                </span>
              </div>
              {/* The one hue goes on the main data element: progress. At risk breaks to red, paused and done go grey. */}
              <div className="flex items-center gap-3">
                <Progress value={p.progress} aria-label={`${p.name} ${p.progress}% complete`}
                  indicatorClassName={p.status === "At risk" ? "bg-negative" : p.status === "Paused" || p.status === "Done" ? "bg-muted-foreground/60" : undefined} />
                <span className="w-9 text-right text-sm">{p.progress}%</span>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex -space-x-1.5">
                {p.team.map((t) => (
                  <PersonAvatar key={t} initials={t} className="size-7 ring-2 ring-card" />
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="invoices">
        <Card className="gap-0 py-0">
          <CardContent className="px-2">
            {selected.length > 0 && (
              <div className="border-rule flex items-center gap-3 border-b px-3 py-2 text-sm">
                <span className="font-medium">{selected.length} selected</span>
                <Button size="sm" variant="outline" onClick={() => { toast(`Sent ${selected.length} reminder(s)`); setSelected([]) }}>Send reminder</Button>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Invoice</TableHead>
                  <TableHead className="hidden w-[38%] sm:table-cell">Client</TableHead>
                  <TableHead className="hidden sm:table-cell">Issued</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.number} data-state={selected.includes(inv.number) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox checked={selected.includes(inv.number)} onCheckedChange={() => toggle(inv.number)} aria-label={`Select ${inv.number}`} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{inv.number}</span>
                      {/* Phone: the fields move to a grey second line, never dropped (app-screens.md 12). */}
                      <span className="text-muted-foreground block text-xs sm:hidden">{inv.client} · {inv.issued === "—" ? "not issued" : inv.issued}</span>
                    </TableCell>
                    <TableCell className="hidden font-medium sm:table-cell">{inv.client}</TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">{inv.issued}</TableCell>
                    <TableCell><Badge variant={statusVariant[inv.status]}>{inv.status}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{money(inv.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity">
        <Card className="py-2">
          <CardContent className="grid">
            {activity.map((a, i) => (
              <div key={i} className="border-rule flex items-start gap-3 border-b py-3 last:border-0">
                <PersonAvatar initials={a.initials} />
                <div className="min-w-0 flex-1 text-sm">
                  <p><span className="font-medium">{a.who}</span> {a.what}</p>
                  <p className="text-muted-foreground text-xs leading-5">{a.when}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
