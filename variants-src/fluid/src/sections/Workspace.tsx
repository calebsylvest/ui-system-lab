import { useState } from "react"
import { Archive, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { projects, invoices, activity } from "@/data"
import { statusColor } from "@/data-status"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardGroup, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsItem, TabsPanel } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownContent, DropdownMenu, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown"
import { MenuItem } from "@/components/ui/menu-item"

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

function ProjectMenu({ name }: { name: string }) {
  return (
    <DropdownMenu>
      <DropdownTrigger render={<Button variant="ghost" size="icon" aria-label={`Actions for ${name}`}><MoreHorizontal /></Button>} />
      <DropdownContent align="end">
        <MenuItem index={0} icon={Pencil} label="Rename" />
        <MenuItem index={1} icon={Copy} label="Duplicate" onSelect={() => toast(`Duplicated ${name}`)} />
        <MenuItem index={2} icon={Archive} label="Archive" onSelect={() => toast(`Archived ${name}`, { action: { label: "Undo", onClick: () => {} } })} />
        <DropdownSeparator />
        <MenuItem index={3} icon={Trash2} label="Delete" />
      </DropdownContent>
    </DropdownMenu>
  )
}

export function Workspace() {
  const [selected, setSelected] = useState<string[]>([])
  const [tab, setTab] = useState(0)
  const toggle = (n: string) => setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]))

  return (
    <div className="flex flex-col gap-3">
      <Tabs selectedIndex={tab} onSelect={setTab} idPrefix="workspace" className="w-fit">
        <TabsItem index={0} label="Projects" />
        <TabsItem index={1} label="Invoices" />
        <TabsItem index={2} label="Activity" />
      </Tabs>

      <TabsPanel index={0} selectedIndex={tab} idPrefix="workspace">
        <CardGroup columns={3} border="outlined" separated>
          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>{p.client}</CardDescription>
                <CardAction><ProjectMenu name={p.name} /></CardAction>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="dot" color={statusColor[p.status]}>{p.status}</Badge>
                  <span className="text-muted-foreground">Due {p.due}</span>
                </div>
                <Progress value={p.progress} />
              </CardContent>
              <CardFooter className="justify-between">
                <div className="flex -space-x-2">
                  {p.team.map((t) => (
                    <Avatar key={t} className="border-2 border-background"><AvatarFallback>{t}</AvatarFallback></Avatar>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{p.progress}%</span>
              </CardFooter>
            </Card>
          ))}
        </CardGroup>
      </TabsPanel>

      <TabsPanel index={1} selectedIndex={tab} idPrefix="workspace">
        <div className="rounded-xl border p-2">
          {selected.length > 0 && (
            <div className="flex items-center gap-2 px-2 py-2 text-sm">
              <span>{selected.length} selected</span>
              <Button variant="tertiary" onClick={() => { toast(`Sent ${selected.length} reminder(s)`); setSelected([]) }}>Send reminder</Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv, i) => (
                <TableRow key={inv.number} index={i}>
                  <TableCell>
                    <Checkbox checked={selected.includes(inv.number)} onCheckedChange={() => toggle(inv.number)} aria-label={`Select ${inv.number}`} />
                  </TableCell>
                  <TableCell className="font-medium">{inv.number}</TableCell>
                  <TableCell>{inv.client}</TableCell>
                  <TableCell>{inv.issued}</TableCell>
                  <TableCell><Badge variant="dot" color={statusColor[inv.status]}>{inv.status}</Badge></TableCell>
                  <TableCell className="text-right tabular-nums">{money(inv.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsPanel>

      <TabsPanel index={2} selectedIndex={tab} idPrefix="workspace">
        <div className="grid gap-4 rounded-xl border p-6">
          {activity.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <Avatar><AvatarFallback>{a.initials}</AvatarFallback></Avatar>
              <div className="text-sm">
                <p><span className="font-medium">{a.who}</span> {a.what}</p>
                <p className="text-muted-foreground text-xs">{a.when}</p>
              </div>
            </div>
          ))}
        </div>
      </TabsPanel>
    </div>
  )
}
