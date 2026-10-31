import { useMemo, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { ledger, type LedgerRow } from "@/data-r3"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type SortKey = "client" | "hours" | "amount" | "due"
type Sort = { key: SortKey; dir: "asc" | "desc" } | null

const PAGE = 6
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })
// Fixed two decimals so the right-aligned hours column lines up like the amounts.
const hrs = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const sortLabels = { client: "Client", hours: "Hours", amount: "Amount", due: "Due" } as const

// A missing value reads as a dash visually and as words to screen readers.
function Missing({ label }: { label: string }) {
  return <><span aria-hidden="true" className="text-muted-foreground">—</span><span className="sr-only">{label}</span></>
}
const statusVariant = { Paid: "secondary", Sent: "outline", Overdue: "destructive", Draft: "outline", Credit: "secondary" } as const

// Round-3 section: a data table with messy content. Search, status filter, sortable
// columns, pagination, a no-results state and a totals row.
export function Ledger() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [sort, setSort] = useState<Sort>(null)
  const [page, setPage] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

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
  // The empty state (and its button) unmounts on clear; put focus back in the search field.
  const clearAndFocus = () => { clear(); requestAnimationFrame(() => searchRef.current?.focus()) }
  // Paging to the first or last page disables the button that was pressed; move focus to its sibling.
  function goTo(p: number) {
    const forward = p > current
    setPage(p)
    requestAnimationFrame(() => {
      const el = forward && p >= pages - 1 ? prevRef.current : !forward && p === 0 ? nextRef.current : null
      if (el && !el.disabled) el.focus()
    })
  }

  // A render helper, not a nested component: a component declared in render remounts every
  // time, which dropped keyboard focus off the sort button after each click.
  const sortHead = (k: SortKey, numeric = false) => {
    const active = sort?.key === k
    const Icon = !active ? ArrowUpDown : sort!.dir === "asc" ? ArrowUp : ArrowDown
    return (
      <TableHead className={cn(numeric && "text-right")} aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}>
        <Button variant="ghost" size="sm" className={cn("h-8", numeric ? "-mr-3" : "-ml-3")} data-lab={`ledger-sort-${k}`} onClick={() => toggleSort(k)}>
          {sortLabels[k]} <Icon aria-hidden="true" className={cn(!active && "opacity-40")} />
        </Button>
      </TableHead>
    )
  }
  const announcement = rows.length === 0
    ? "No invoices match"
    : `${rows.length} ${rows.length === 1 ? "entry" : "entries"}, page ${current + 1} of ${pages}`

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Ledger</CardTitle>
        <CardDescription>All invoices and credits. Search, filter, sort and page through them.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <Search aria-hidden="true" className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input ref={searchRef} id="ledger-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0) }} placeholder="Search client, project or ID" className="pl-8" aria-label="Search ledger" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
            <SelectTrigger id="ledger-status" className="w-40" aria-label="Status"><SelectValue /></SelectTrigger>
            <SelectContent className="motion-reduce:animate-none">
              <SelectItem value="all">All statuses</SelectItem>
              {["Paid", "Sent", "Overdue", "Draft", "Credit"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <span hidden data-lab="ledger-filter" onClick={() => { setQuery("north"); setPage(0) }} />
          <span hidden data-lab="ledger-empty" onClick={() => { setQuery("zzzz"); setPage(0) }} />
          <span hidden data-lab="ledger-clear" onClick={clear} />
          <span hidden data-lab="ledger-sort" onClick={() => toggleSort("amount")} />
        </div>
        <p role="status" className="sr-only">{announcement}</p>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
            <p className="font-medium text-balance">No invoices match</p>
            <p className="text-muted-foreground max-w-prose px-4 text-sm text-pretty break-words">
              {query.trim() ? <>Nothing matches “{query.trim()}”{status !== "all" ? ` with status ${status}` : ""}.</> : <>No invoices have the status {status}.</>}
            </p>
            <Button variant="outline" size="sm" onClick={clearAndFocus}>Clear filters</Button>
          </div>
        ) : (
          <>
            <Table>
              <caption className="sr-only">
                Invoices and credits{sort ? `, sorted by ${sortLabels[sort.key]} ${sort.dir === "asc" ? "ascending" : "descending"}` : ""}, page {current + 1} of {pages}
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  {sortHead("client")}
                  <TableHead>Project</TableHead>
                  {sortHead("hours", true)}
                  {sortHead("amount", true)}
                  <TableHead>Status</TableHead>
                  {sortHead("due")}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium tabular-nums">{r.id}</TableCell>
                    <TableCell className="max-w-56 truncate" title={r.client}>{r.client}</TableCell>
                    <TableCell className="max-w-48 truncate" title={r.project ?? undefined}>{r.project ?? <Missing label="No project" />}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.hours === null ? <Missing label="No hours" /> : hrs(r.hours)}</TableCell>
                    <TableCell className="text-right tabular-nums">{money(r.amount)}</TableCell>
                    <TableCell><Badge variant={statusVariant[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell className="tabular-nums">{r.due ?? <Missing label="No due date" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot className="border-t">
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="row" colSpan={4} className="text-muted-foreground font-normal tabular-nums">
                    Total for {rows.length} {rows.length === 1 ? "entry" : "entries"}
                  </TableHead>
                  <TableCell className="text-right font-medium tabular-nums">{money(total)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </tfoot>
            </Table>
            <nav aria-label="Ledger pages" className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground tabular-nums">Page {current + 1} of {pages}</span>
              <div className="flex gap-1">
                <Button ref={prevRef} variant="outline" size="sm" data-lab="ledger-prev" disabled={current === 0} onClick={() => goTo(current - 1)}><ChevronLeft aria-hidden="true" /> Previous</Button>
                <Button ref={nextRef} variant="outline" size="sm" data-lab="ledger-next" disabled={current >= pages - 1} onClick={() => goTo(current + 1)}>Next <ChevronRight aria-hidden="true" /></Button>
              </div>
            </nav>
          </>
        )}
      </CardContent>
    </Card>
  )
}
