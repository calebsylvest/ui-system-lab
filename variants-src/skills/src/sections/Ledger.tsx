import { useMemo, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { ledger, type LedgerRow } from "@/data-r3"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type SortKey = "client" | "hours" | "amount" | "due"
type Sort = { key: SortKey; dir: "asc" | "desc" } | null

const PAGE = 6
// better-writing: numbers through Intl, never hand-built. Hours get grouping (9,512) like amounts do.
const moneyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const hoursFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })
// better-typography: a true minus sign (U+2212) for credits, not the hyphen Intl emits
const money = (n: number) => moneyFmt.format(n).replace("-", "\u2212")
// better-writing: whole strings per plural category
const plural = new Intl.PluralRules("en-US")
const entries = (n: number) => (plural.select(n) === "one" ? `${n} entry` : `${n} entries`)
const sortNames: Record<SortKey, string> = { client: "client", hours: "hours", amount: "amount", due: "due date" }

// A missing value: a dash for the eye, words for the screen reader
function Missing({ label }: { label: string }) {
  return <><span aria-hidden="true" className="text-muted-foreground">—</span><span className="sr-only">{label}</span></>
}
const statusVariant = { Paid: "secondary", Sent: "outline", Overdue: "destructive", Draft: "outline", Credit: "secondary" } as const

// better-writing: a filtered empty state names the query and points forward. Built whole, not from fragments.
function emptyText(q: string, status: string) {
  if (q && status !== "all") return `Nothing with the status ${status} matches “${q}”. Try another client name or invoice ID, or clear the filters.`
  if (q) return `Nothing matches “${q}”. Try a client name, a project or an invoice ID like L-2039.`
  return `No invoices have the status ${status}. Clear the filters to see every invoice.`
}

// Round-3 section: a data table with messy content. Search, status filter, sortable
// columns, pagination, a no-results state and a totals row.
export function Ledger() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [sort, setSort] = useState<Sort>(null)
  const [page, setPage] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)

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
  // The Clear filters button unmounts when rows return; hand focus to the search field instead of <body>
  const clearFromEmpty = () => { clear(); requestAnimationFrame(() => searchRef.current?.focus()) }

  // Called as a function, not rendered as <SortHead/>: a component defined inside render is a new type every
  // render, so React remounted the button on each sort and keyboard focus fell to <body>.
  const sortHead = (k: SortKey, label: string, end = false) => {
    const active = sort?.key === k
    const Icon = !active ? ArrowUpDown : sort!.dir === "asc" ? ArrowUp : ArrowDown
    return (
      <TableHead className={end ? "text-end" : undefined} aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}>
        {/* Ghost padding pulled out on the aligned side so the label sits on the column edge */}
        <Button variant="ghost" size="sm" className={end ? "-me-3 has-[>svg:first-child]:ps-3" : "-ms-3"} data-lab={`ledger-sort-${k}`} onClick={() => toggleSort(k)}>
          {label} <Icon aria-hidden="true" className={active ? undefined : "text-muted-foreground"} />
        </Button>
      </TableHead>
    )
  }

  const first = current * PAGE + 1
  const last = Math.min(rows.length, first + PAGE - 1)
  const sortText = sort ? `, sorted by ${sortNames[sort.key]} ${sort.dir === "asc" ? "ascending" : "descending"}` : ""
  const announcement = rows.length === 0 ? "No invoices match" : `${entries(rows.length)}, showing ${first}–${last}${sortText}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ledger</CardTitle>
        <CardDescription className="text-pretty">Every invoice and credit, newest first.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div role="search" className="relative min-w-0 flex-1 basis-56">
            <Label htmlFor="ledger-search" className="sr-only">Search client, project or invoice ID</Label>
            <Search aria-hidden="true" strokeWidth={1.5} className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2" />
            <Input id="ledger-search" ref={searchRef} type="search" name="ledgerSearch" autoComplete="off" spellCheck={false} value={query} onChange={(e) => { setQuery(e.target.value); setPage(0) }} placeholder="Northwind or L-2039" className="ps-8" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
            <SelectTrigger id="ledger-status" className="w-40" aria-label="Status filter"><SelectValue /></SelectTrigger>
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

        {/* Stable polite region, rendered before its text changes: result count, range and sort */}
        <p role="status" className="sr-only">{announcement}</p>

        {rows.length === 0 ? (
          <div className="bg-muted/50 flex flex-col items-center gap-2 rounded-md px-4 py-10 text-center">
            <p className="font-medium">No invoices match</p>
            <p className="text-muted-foreground text-sm text-pretty">{emptyText(query.trim(), status)}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={clearFromEmpty}>Clear filters</Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  {sortHead("client", "Client")}
                  <TableHead>Project</TableHead>
                  {sortHead("hours", "Hours", true)}
                  {sortHead("amount", "Amount", true)}
                  <TableHead>Status</TableHead>
                  {sortHead("due", "Due")}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium tabular-nums">{r.id}</TableCell>
                    {/* Long names wrap instead of truncating: a hover-only title gave keyboard and touch users no way
                        to the full value. overflow-wrap:anywhere breaks the unbroken email only where it must. */}
                    <TableCell className="max-w-64 min-w-40 whitespace-normal text-pretty [overflow-wrap:anywhere]">{r.client}</TableCell>
                    <TableCell className="max-w-56 min-w-36 whitespace-normal text-pretty [overflow-wrap:anywhere]">{r.project ?? <Missing label="No project" />}</TableCell>
                    <TableCell className="text-end tabular-nums">{r.hours == null ? <Missing label="No hours logged" /> : hoursFmt.format(r.hours)}</TableCell>
                    <TableCell className="text-end tabular-nums">{money(r.amount)}</TableCell>
                    <TableCell><Badge variant={statusVariant[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell className="tabular-nums">{r.due ?? <Missing label="No due date" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* The totals row is a footer, not data: <tfoot> keeps it out of sorting and tells AT what it is */}
              <TableFooter>
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4}>Total <span className="text-muted-foreground font-normal tabular-nums">· {entries(rows.length)}</span></TableCell>
                  <TableCell className="text-end tabular-nums">{money(total)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            </Table>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground tabular-nums">{first}–{last} of {rows.length} · Page {current + 1} of {pages}</span>
              <div className="flex gap-2">
                {/* aria-disabled, not disabled: reaching the last page keeps focus on Next (round-1 Save pattern) */}
                <Button variant="outline" size="sm" data-lab="ledger-prev" aria-disabled={current === 0 || undefined} onClick={() => current > 0 && setPage(current - 1)}><ChevronLeft aria-hidden="true" /> Previous</Button>
                <Button variant="outline" size="sm" data-lab="ledger-next" className="pe-2.5" aria-disabled={current >= pages - 1 || undefined} onClick={() => current < pages - 1 && setPage(current + 1)}>Next <ChevronRight aria-hidden="true" /></Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
