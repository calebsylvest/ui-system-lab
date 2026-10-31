import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { ledger, type LedgerRow } from "@/data-r3"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { plural } from "@/lib/utils"

type SortKey = "client" | "hours" | "amount" | "due"
type Sort = { key: SortKey; dir: "asc" | "desc" } | null

const PAGE = 6
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })
const statusVariant = { Paid: "secondary", Sent: "outline", Overdue: "destructive", Draft: "outline", Credit: "secondary" } as const

// Round-3 section: a data table with messy content. Search, status filter, sortable
// columns, pagination, a no-results state and a totals row.
// Emil variant: deliberately no motion here. Sorting, filtering, typing and paging are
// tens-per-day, functional, data the user is reading (find-animation-opportunities gate:
// Frequency + Function), and search results follow keystrokes ("never animate
// keyboard-initiated actions"). Polish is in the numbers instead: tabular-nums so columns
// and totals don't jitter as filters change (ui-cheatsheet).
export function Ledger() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [sort, setSort] = useState<Sort>(null)
  const [page, setPage] = useState(0)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let r = ledger.filter((row) =>
      (status === "all" || row.status === status) &&
      (!q || [row.id, row.client, row.project ?? ""].some((v) => v.toLowerCase().includes(q))))
    if (sort) {
      const val = (row: LedgerRow) =>
        sort.key === "client" ? row.client.toLowerCase() : sort.key === "due" ? row.dueOrder : (row[sort.key] ?? -Infinity)
      r = [...r].sort((a, b) => {
        const x = val(a), y = val(b)
        const c = x < y ? -1 : x > y ? 1 : 0
        return sort.dir === "asc" ? c : -c
      })
    }
    return r
  }, [query, status, sort])

  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const current = Math.min(page, pages - 1)
  const visible = rows.slice(current * PAGE, current * PAGE + PAGE)
  const total = rows.reduce((a, r) => a + r.amount, 0)

  function toggleSort(key: SortKey) {
    setPage(0)
    setSort((s) => (!s || s.key !== key ? { key, dir: key === "client" ? "asc" : "desc" } : s.dir === "desc" ? { key, dir: "asc" } : s.dir === "asc" && key === "client" ? { key, dir: "desc" } : null))
  }
  const clear = () => { setQuery(""); setStatus("all"); setSort(null); setPage(0) }

  const SortHead = ({ k, label, className }: { k: SortKey; label: string; className?: string }) => {
    const active = sort?.key === k
    const Icon = !active ? ArrowUpDown : sort!.dir === "asc" ? ArrowUp : ArrowDown
    return (
      <TableHead className={className} aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}>
        <Button variant="ghost" size="sm" className="-ml-3 h-8" data-lab={`ledger-sort-${k}`} onClick={() => toggleSort(k)}>
          {label} <Icon className={active ? "" : "opacity-40"} />
        </Button>
      </TableHead>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ledger</CardTitle>
        <CardDescription>All invoices and credits. Search, filter, sort and page through them.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input id="ledger-search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0) }} placeholder="Search client, project or ID" className="pl-8" aria-label="Search ledger" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
            <SelectTrigger id="ledger-status" className="w-40" aria-label="Status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {["Paid", "Sent", "Overdue", "Draft", "Credit"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <span hidden data-lab="ledger-filter" onClick={() => { setQuery("north"); setPage(0) }} />
          <span hidden data-lab="ledger-empty" onClick={() => { setQuery("zzzz"); setPage(0) }} />
          <span hidden data-lab="ledger-clear" onClick={clear} />
          <span hidden data-lab="ledger-sort" onClick={() => toggleSort("amount")} />
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
            <p className="font-medium">No invoices match</p>
            <p className="text-muted-foreground max-w-[65ch] text-sm">Nothing matches “{query}”{status !== "all" ? ` with status ${status}` : ""}.</p>
            <Button variant="outline" size="sm" onClick={clear}>Clear filters</Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <SortHead k="client" label="Client" />
                  <TableHead>Project</TableHead>
                  <SortHead k="hours" label="Hours" className="text-right" />
                  <SortHead k="amount" label="Amount" className="text-right" />
                  <TableHead>Status</TableHead>
                  <SortHead k="due" label="Due" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.id}</TableCell>
                    <TableCell className="max-w-56 truncate" title={r.client}>{r.client}</TableCell>
                    <TableCell className="max-w-48 truncate" title={r.project ?? undefined}>{r.project ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.hours ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{money(r.amount)}</TableCell>
                    <TableCell><Badge variant={statusVariant[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell>{r.due ?? "—"}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="text-muted-foreground tabular-nums">{plural(rows.length, "entry", "entries")}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{money(total)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground tabular-nums">Page {current + 1} of {pages}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" data-lab="ledger-prev" disabled={current === 0} onClick={() => setPage(current - 1)}><ChevronLeft /> Previous</Button>
                <Button variant="outline" size="sm" data-lab="ledger-next" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Next <ChevronRight /></Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
