import { useMemo, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react"
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
// Fixed decimals per metric (app-screens.md 7.4): money 2, hours 2, thousands separators everywhere,
// the sign in the text ("-$450.00"), never in the colour (7.5).
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })
const hoursFmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
// One status mark per row, pale pairs; red only on the overdue fact (7.6, 11 "red is a signal").
const statusVariant = { Paid: "positive", Sent: "neutral", Overdue: "negative", Draft: "outline", Credit: "neutral" } as const
const Dash = () => <span className="text-muted-foreground" aria-label="None">—</span>

// Round-3 section: a data table with messy content. Search, status filter, sortable
// columns, pagination, a no-results state and a totals row.
// taste-skill (app-screens.md 7): 12px grey sentence-case headers with the sort glyph on the active
// column only; the client is the identity column (widest, ink, truncated with the full name on hover);
// IDs in Plex Mono; figures right-aligned in tabular figures on one right edge; a missing value is a grey
// dash, a real zero is printed. The total is stated above the table and the range beside the pager.
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
  // The subline carries the finding, computed from the rows in view (2.2, 11 "counts follow the view").
  const overdue = rows.filter((r) => r.status === "Overdue")
  const overdueSum = overdue.reduce((a, r) => a + r.amount, 0)
  const filtered = status !== "all" || query.trim() !== ""

  function toggleSort(key: SortKey) {
    setPage(0)
    setSort((s) => (!s || s.key !== key ? { key, dir: key === "client" ? "asc" : "desc" } : s.dir === "desc" ? { key, dir: "asc" } : s.dir === "asc" && key === "client" ? { key, dir: "desc" } : null))
  }
  const clear = () => { setQuery(""); setStatus("all"); setSort(null); setPage(0) }
  // Keyboard stays in reading order (SKILL 9): the Clear button leaves with the empty state, so focus
  // returns to the search it just cleared; a pager button that becomes disabled hands focus to the other.
  const clearFromButton = () => { clear(); requestAnimationFrame(() => searchRef.current?.focus()) }
  function turn(to: number) {
    setPage(to)
    requestAnimationFrame(() => {
      if (to <= 0) nextRef.current?.focus()
      else if (to >= pages - 1) prevRef.current?.focus()
    })
  }

  const SortHead = ({ k, label, numeric, className }: { k: SortKey; label: string; numeric?: boolean; className?: string }) => {
    const active = sort?.key === k
    const Icon = active && sort!.dir === "asc" ? ArrowUp : ArrowDown
    return (
      <TableHead className={cn(numeric && "text-right", className)} aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}>
        <button
          type="button"
          data-lab={`ledger-sort-${k}`}
          onClick={() => toggleSort(k)}
          className={cn(
            "focus-visible:ring-ring/50 hover:text-foreground -mx-1 inline-flex h-7 items-center gap-1 rounded-sm px-1 outline-none focus-visible:ring-[3px]",
            numeric && "flex-row-reverse",
            active && "text-foreground",
          )}
        >
          {label}
          {/* A sort glyph on the active column only (7.2). */}
          {active ? <Icon className="size-3" aria-hidden="true" /> : <span className="w-3" aria-hidden="true" />}
        </button>
      </TableHead>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ledger</CardTitle>
        <CardDescription aria-live="polite">
          {rows.length} {rows.length === 1 ? "entry" : "entries"}{filtered ? " match" : ""}
          {overdue.length > 0 && <>{" · "}<span className="text-negative">{overdue.length} overdue, {money(overdueSum)}</span></>}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Toolbar: one search, one filter, one control height (7.8, 8.1). */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1 sm:max-w-80">
            <Search className="text-muted-foreground absolute top-1/2 left-[13px] size-3.5 -translate-y-1/2" aria-hidden="true" />
            <Input ref={searchRef} id="ledger-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0) }} placeholder="Search client, project or ID" className="h-8 pl-[34px]" aria-label="Search ledger" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
            <SelectTrigger id="ledger-status" className="h-8 w-40" aria-label="Status"><SelectValue /></SelectTrigger>
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

        <Table className="min-w-[460px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[76px] sm:w-[84px]">ID</TableHead>
              <SortHead k="client" label="Client" />
              <TableHead className="hidden w-[26%] md:table-cell">Project</TableHead>
              <SortHead k="hours" label="Hours" numeric className="hidden w-[88px] sm:table-cell" />
              <SortHead k="amount" label="Amount" numeric className="w-[132px]" />
              <TableHead className="w-[88px]">Status</TableHead>
              <SortHead k="due" label="Due" numeric className="hidden w-[76px] sm:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              // An empty view keeps its frame and its header: one sentence spanning the block (11).
              <TableRow className="border-0">
                <TableCell colSpan={7} className="h-auto px-0 py-3 whitespace-normal">
                  <div className="border-input flex min-h-[38px] flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-dashed px-3 py-1.5 text-sm">
                    <p className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                      <span className="font-medium">No invoices match</span>{" "}
                      <span className="text-muted-foreground">
                        {query.trim() ? `“${query.trim()}”` : "this filter"}{status !== "all" ? ` with status ${status}` : ""}.
                      </span>
                    </p>
                    <Button variant="ghost" size="sm" className="-my-1 underline-offset-4 hover:underline" onClick={clearFromButton}>Clear filters</Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-[13px]">{r.id}{/* taste-skill-ignore: IDs in mono, app-screens.md 7.4 */}</TableCell>
                    <TableCell className="min-w-0">
                      {/* Identity in ink, one line, ellipsis, full name on hover; never broken inside a word (7.4). */}
                      <span className="block truncate font-medium" title={r.client}>{r.client}</span>
                      {/* Below md the project moves to a grey second line rather than being dropped (12). */}
                      <span className="text-muted-foreground block truncate text-xs md:hidden" title={r.project ?? undefined}>
                        {r.project ?? "No project"}{r.due ? <span className="sm:hidden"> · Due {r.due}</span> : null}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden truncate md:table-cell" title={r.project ?? undefined}>{r.project ?? <Dash />}</TableCell>
                    <TableCell className="text-muted-foreground hidden text-right sm:table-cell">{r.hours == null ? <Dash /> : hoursFmt(r.hours)}</TableCell>
                    <TableCell className="text-right font-medium">{money(r.amount)}</TableCell>
                    <TableCell><Badge variant={statusVariant[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground hidden text-right sm:table-cell">{r.due ?? <Dash />}</TableCell>
                  </TableRow>
                ))}
                {/* Totals: the strongest rule in the table sits over the sum; the figure on the amount's edge. */}
                <TableRow className="border-border border-t border-b-0">
                  <TableCell colSpan={2} className="text-muted-foreground text-[13px]">
                    Total, {rows.length} {rows.length === 1 ? "entry" : "entries"}{pages > 1 ? " on all pages" : ""}
                  </TableCell>
                  <TableCell className="hidden md:table-cell" />
                  <TableCell className="hidden sm:table-cell" />
                  <TableCell className="text-right font-semibold">{money(total)}</TableCell>
                  <TableCell />
                  <TableCell className="hidden sm:table-cell" />
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>

        {rows.length > 0 && (
          <div className="flex items-center justify-between gap-2 text-sm">
            {/* The range, not "Page x of y" (7.8 full list screen). */}
            <span className="text-muted-foreground" aria-live="polite">
              {current * PAGE + 1}–{current * PAGE + visible.length} of {rows.length}
            </span>
            <div className="flex gap-2">
              <Button ref={prevRef} variant="outline" size="sm" data-lab="ledger-prev" disabled={current === 0} onClick={() => turn(current - 1)}><ChevronLeft /> Previous</Button>
              <Button ref={nextRef} variant="outline" size="sm" data-lab="ledger-next" disabled={current >= pages - 1} onClick={() => turn(current + 1)}>Next <ChevronRight /></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
