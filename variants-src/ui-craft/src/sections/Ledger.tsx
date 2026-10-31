import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Search, X } from "lucide-react"
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
const statuses = ["Paid", "Sent", "Overdue", "Draft", "Credit"] as const

// Numbers (surface-typography › Numeric figures): a true minus sign (U+2212) instead of a hyphen,
// so "−$450.00" lines up and reads as negative; hours drop trailing zeros but keep grouping.
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const money = (n: number) => currency.format(n).replace("-", "−")
const hoursFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })

// Status → semantic tokens, matching the round-1 mapping (Paid = success, Overdue = danger).
// Every badge keeps its text label, so colour is never the only signal (surface-colour).
const statusVariant = { Paid: "success", Sent: "outline", Overdue: "destructive", Draft: "outline", Credit: "secondary" } as const

// Missing values: a muted dash for sighted users, words for screen readers (a bare "—" is read as "dash").
function Missing({ label }: { label: string }) {
  return <><span aria-hidden className="text-muted-foreground/70">—</span><span className="sr-only">{label}</span></>
}

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
  const from = rows.length ? current * PAGE + 1 : 0
  const to = current * PAGE + visible.length
  const filtered = query.trim() !== "" || status !== "all"

  // Sorting (system-patterns › Tables): a new column sorts ascending, the same column toggles to
  // descending, and a third click returns to the original order.
  function toggleSort(key: SortKey) {
    setPage(0)
    setSort((s) => (!s || s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null))
  }
  const clear = () => { setQuery(""); setStatus("all"); setSort(null); setPage(0) }
  const clearQuery = () => { setQuery(""); setPage(0); searchRef.current?.focus() }

  // Paging to the first/last page disables the button that was pressed; keep keyboard focus on
  // the other one instead of letting it fall to <body> (surface-details › focus return).
  const pageFocus = useRef<"prev" | "next" | null>(null)
  useEffect(() => {
    const want = pageFocus.current
    pageFocus.current = null
    if (want === "next" && current >= pages - 1) prevRef.current?.focus()
    if (want === "prev" && current === 0) nextRef.current?.focus()
  }, [current, pages])
  function go(delta: -1 | 1) {
    const btn = delta === 1 ? nextRef.current : prevRef.current
    if (btn && document.activeElement === btn) pageFocus.current = delta === 1 ? "next" : "prev"
    setPage(current + delta)
  }

  // A render function, not a component declared in render: a new component type each render would
  // remount the header button on every sort and drop keyboard focus to <body>.
  const sortHead = (k: SortKey, label: string, numeric?: boolean) => {
    const active = sort?.key === k
    const Icon = !active ? ChevronsUpDown : sort!.dir === "asc" ? ArrowUp : ArrowDown
    return (
      <TableHead key={k} className={numeric ? "text-right" : undefined} aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}>
        {/* The label sits on the same edge as its column's values: numeric headers right-aligned with the
            arrow on the inside, so the label lines up with the digits (surface-details › Optical alignment). */}
        <Button
          variant="ghost" size="sm"
          className={cn("group/sort text-muted-foreground hover:text-foreground h-8 gap-1 px-2 font-medium", numeric ? "-mr-2 flex-row-reverse" : "-ml-2", active && "text-foreground")}
          data-lab={`ledger-sort-${k}`}
          onClick={() => toggleSort(k)}
        >
          {label}
          <Icon aria-hidden className={cn("size-3.5", !active && "opacity-0 group-hover/sort:opacity-60 group-focus-visible/sort:opacity-60 transition-opacity")} />
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
      <CardContent className="grid gap-3">
        {/* Inputs live inside a form, and search is a search landmark (surface-details › Forms). */}
        <form role="search" aria-label="Ledger" className="flex flex-wrap items-center gap-2" onSubmit={(e) => e.preventDefault()}>
          <div className="relative min-w-56 flex-1">
            <label htmlFor="ledger-search" className="sr-only">Search ledger</label>
            <Search aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              ref={searchRef} id="ledger-search" type="search" autoComplete="off" enterKeyHint="search"
              value={query} onChange={(e) => { setQuery(e.target.value); setPage(0) }}
              onKeyDown={(e) => { if (e.key === "Escape" && query) { e.preventDefault(); clearQuery() } }}
              placeholder="Search client, project or ID"
              className="pr-9 pl-8 [&::-webkit-search-cancel-button]:hidden"
            />
            {/* Visible clear control while text is present; Escape does the same (system-patterns › Search). */}
            {query && (
              <Button variant="ghost" size="icon" aria-label="Clear search" onClick={clearQuery}
                className="hit-area text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2 rounded-sm">
                <X />
              </Button>
            )}
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
            <SelectTrigger id="ledger-status" className="w-40" aria-label="Status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <span hidden data-lab="ledger-filter" onClick={() => { setQuery("north"); setPage(0) }} />
          <span hidden data-lab="ledger-empty" onClick={() => { setQuery("zzzz"); setPage(0) }} />
          <span hidden data-lab="ledger-clear" onClick={clear} />
          <span hidden data-lab="ledger-sort" onClick={() => toggleSort("amount")} />
        </form>

        {/* Result count + clear-all above the table (system-patterns › Filtering). Fixed height so it never shifts the table. */}
        <div className="text-muted-foreground flex h-7 items-center justify-between gap-2 text-sm">
          <p aria-live="polite" className="tabular-nums">
            {rows.length === 0 ? "No entries" : filtered ? `${rows.length} of ${ledger.length} entries` : `${ledger.length} entries`}
          </p>
          {filtered && rows.length > 0 && (
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -mr-2 h-7" onClick={clear}>Clear filters</Button>
          )}
        </div>

        {/* min-h holds six 40px rows + header + total, so short pages and the empty state don't
            move the pagination out from under the pointer (surface-details › Layout shift). */}
        <div className="min-h-80">
          {rows.length === 0 ? (
            <div className="animate-enter bg-muted/40 flex min-h-80 flex-col items-center justify-center gap-1 rounded-lg px-6 text-center">
              <p className="font-medium">No invoices match</p>
              <p className="text-muted-foreground max-w-sm text-sm text-pretty">
                {query.trim()
                  ? <>Nothing matches “<span className="break-all">{query.trim()}</span>”{status !== "all" ? ` with status ${status}` : ""}. Check the spelling or clear the filters to see all {ledger.length} entries.</>
                  : <>No {status} entries yet. Clear the filters to see all {ledger.length} entries.</>}
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={clear}>Clear filters</Button>
            </div>
          ) : (
            <Table className="[&_td]:h-10 [&_th]:h-10">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="bg-card sticky left-0 z-10">ID</TableHead>
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
                  <TableRow key={r.id} className="group/row">
                    {/* Sticky identifier column when the table scrolls sideways on small screens (system-patterns › Responsive). */}
                    <TableCell className="bg-card group-hover/row:bg-[color-mix(in_oklab,var(--color-muted)_50%,var(--color-card))] sticky left-0 z-10 font-medium tabular-nums transition-colors">{r.id}</TableCell>
                    {/* Long names truncate to one line so one client can't grow the row; the full text is in the
                        title and the DOM, so screen readers still get all of it (interface-polish › Text overflow). */}
                    <TableCell className="max-w-56 truncate" title={r.client}>{r.client}</TableCell>
                    <TableCell className="text-muted-foreground max-w-48 truncate" title={r.project ?? undefined}>{r.project ?? <Missing label="No project" />}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.hours == null ? <Missing label="No hours" /> : hoursFmt.format(r.hours)}</TableCell>
                    <TableCell className={cn("text-right font-medium tabular-nums", r.amount === 0 && "text-muted-foreground")}>{money(r.amount)}</TableCell>
                    <TableCell><Badge variant={statusVariant[r.status]} className={r.status === "Draft" ? "text-muted-foreground" : undefined}>{r.status}</Badge></TableCell>
                    <TableCell className="tabular-nums">{r.due ?? <Missing label="No due date" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* A real <tfoot>, labelled with what it sums: every matching entry, not just this page. */}
              <tfoot className="border-t">
                <TableRow className="hover:bg-transparent border-0">
                  <TableCell colSpan={4} className="bg-card sticky left-0 font-medium">
                    Total <span className="text-muted-foreground font-normal tabular-nums">· {rows.length === ledger.length ? `all ${rows.length} entries` : `${rows.length} matching ${rows.length === 1 ? "entry" : "entries"}`}</span>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{money(total)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </tfoot>
            </Table>
          )}
        </div>

        {rows.length > 0 && (
          <nav aria-label="Ledger pages" className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground tabular-nums">
              {from}–{to} of {rows.length} · Page {current + 1} of {pages}
            </span>
            <div className="flex gap-2">
              <Button ref={prevRef} variant="outline" size="sm" data-lab="ledger-prev" disabled={current === 0} onClick={() => go(-1)}><ChevronLeft aria-hidden /> Previous</Button>
              <Button ref={nextRef} variant="outline" size="sm" data-lab="ledger-next" disabled={current >= pages - 1} onClick={() => go(1)}>Next <ChevronRight aria-hidden /></Button>
            </div>
          </nav>
        )}
      </CardContent>
    </Card>
  )
}
