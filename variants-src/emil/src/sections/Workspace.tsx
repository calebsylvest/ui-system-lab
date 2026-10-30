import { useState } from "react"
import { Archive, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { plural } from "@/lib/utils"
import { projects, invoices, activity, statusVariant } from "@/data"
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

function ProjectMenu({ name }: { name: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${name}`}><MoreHorizontal /></Button>
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

      <TabsContent value="projects" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>{p.client}</CardDescription>
              <CardAction><ProjectMenu name={p.name} /></CardAction>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
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
              <span className="text-sm text-muted-foreground tabular-nums">{p.progress}%</span>
            </CardFooter>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="invoices">
        <Card className="py-2">
          <CardContent className="px-2">
            {selected.length > 0 && (
              <div className="enter-fade flex items-center gap-2 px-2 py-2 text-sm">
                <span className="tabular-nums">{selected.length} selected</span>
                <Button size="sm" variant="outline" onClick={() => { toast(`Sent ${plural(selected.length, "reminder", "reminders")}`); setSelected([]) }}>Send reminder</Button>
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
                {invoices.map((inv) => (
                  <TableRow key={inv.number} data-state={selected.includes(inv.number) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox checked={selected.includes(inv.number)} onCheckedChange={() => toggle(inv.number)} aria-label={`Select ${inv.number}`} />
                    </TableCell>
                    <TableCell className="font-medium">{inv.number}</TableCell>
                    <TableCell>{inv.client}</TableCell>
                    <TableCell>{inv.issued}</TableCell>
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
          <CardContent className="grid gap-4">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <Avatar><AvatarFallback>{a.initials}</AvatarFallback></Avatar>
                <div className="text-sm">
                  <p><span className="font-medium">{a.who}</span> {a.what}</p>
                  <p className="text-muted-foreground text-xs">{a.when}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
