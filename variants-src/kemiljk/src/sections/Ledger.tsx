import { useMemo, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { ledger, type LedgerRow } from "@/data-r3"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type SortKey = "client" | "hours" | "amount" | "due"
type Sort = { key: SortKey; dir: "asc" | "desc" } | null

const PAGE = 6
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
// A real minus sign (U+2212), so a credit doesn't read as a hyphenated number.
const money = (n: number) => usd.format(n).replace("-", "−")
const hoursFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })
// Same emphasis as round 1: only Overdue is solid red, Paid is soft green, Draft is dashed.
// A credit is money going back to the client, so it is quiet rather than celebratory.
const statusVariant = { Paid: "success", Sent: "outline", Overdue: "destructive", Draft: "muted", Credit: "secondary" } as const
const statuses = ["Paid", "Sent", "Overdue", "Draft", "Credit"] as const
const sortWords: Record<SortKey, [string, string, string]> = {
  client: ["client", "A to Z", "Z to A"],
  hours: ["hours", "fewest first", "most first"],
  amount: ["amount", "smallest first", "largest first"],
  due: ["due date", "earliest first", "latest first"],
}

// Missing values sort last in both directions, so a blank never leads a sorted column.
const sortValue = (row: LedgerRow, key: SortKey): string | number | null =>
  key === "client" ? row.client.toLocaleLowerCase() : key === "due" ? (row.due === null ? null : row.dueOrder) : row[key]

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
    const q = query.trim().toLocaleLowerCase()
    let r = ledger.filter((row) =>
      (status === "all" || row.status === status) &&
      (!q || [row.id, row.client, row.project ?? ""].some((v) => v.toLocaleLowerCase().includes(q))))
    if (sort) {
      r = [...r].sort((a, b) => {
        const x = sortValue(a, sort.key), y = sortValue(b, sort.key)
        if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1
        const c = typeof x === "string" ? x.localeCompare(y as string) : x - (y as number)
        return sort.dir === "asc" ? c : -c
      })
    }
    return r
  }, [query, status, sort])

  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const current = Math.min(page, pages - 1)
  const start = current * PAGE
  const visible = rows.slice(start, start + PAGE)
  const total = rows.reduce((a, r) => a + r.amount, 0)
  const credits = rows.filter((r) => r.amount < 0).length
  const filtered = query.trim() !== "" || status !== "all"

  function toggleSort(key: SortKey) {
    setPage(0)
    setSort((s) => (!s || s.key !== key ? { key, dir: key === "client" ? "asc" : "desc" } : s.dir === "desc" ? { key, dir: "asc" } : s.dir === "asc" && key === "client" ? { key, dir: "desc" } : null))
  }
  const clear = () => { setQuery(""); setStatus("all"); setSort(null); setPage(0) }
  // The empty state's button unmounts when it clears, so focus goes back to the search field.
  const clearAndFocus = () => { clear(); requestAnimationFrame(() => searchRef.current?.focus()) }

  // When Previous or Next disables itself at the first or last page, hand focus to the other one
  // instead of dropping it to <body>.
  function goTo(p: number) {
    setPage(p)
    if (p === 0) requestAnimationFrame(() => nextRef.current?.focus())
    else if (p === pages - 1) requestAnimationFrame(() => prevRef.current?.focus())
  }

  const what = status === "all" ? (credits ? "invoices and credits" : "invoices") : `${status.toLowerCase()} ${status === "Credit" ? "entries" : "invoices"}`
  const summary =
    rows.length === 0
      ? "No invoices match."
      : `${rows.length === ledger.length ? "All" : rows.length} of ${ledger.length} entries` +
        (sort ? `, sorted by ${sortWords[sort.key][0]}, ${sortWords[sort.key][sort.dir === "asc" ? 1 : 2]}` : ", newest first") +
        (pages > 1 ? `. Page ${current + 1} of ${pages}.` : ".")

  // A render helper, not a nested component: a component defined in render remounts on every
  // state change, which dropped keyboard focus from the sort button the moment it was pressed.
  const sortHead = (k: SortKey, label: string, numeric = false) => {
    const active = sort?.key === k
    const Icon = !active ? ArrowUpDown : sort!.dir === "asc" ? ArrowUp : ArrowDown
    return (
      <TableHead scope="col" className={numeric ? "text-right" : undefined} aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 gap-1 px-2 font-medium", numeric ? "-mr-2 flex-row-reverse" : "-ml-2", active ? "text-foreground" : "text-muted-foreground")}
          data-lab={`ledger-sort-${k}`}
          onClick={() => toggleSort(k)}
        >
          {label}
          <Icon aria-hidden className={active ? "" : "opacity-50"} />
        </Button>
      </TableHead>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ledger</CardTitle>
        <CardDescription>{ledger.length} invoices and credits, newest first. Totals include credits.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-end gap-2">
          <search className="relative min-w-56 flex-1">
            <Label htmlFor="ledger-search" className="sr-only">Search ledger</Label>
            <Search aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              ref={searchRef}
              id="ledger-search"
              type="search"
              autoComplete="off"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0) }}
              placeholder="Search client, project or ID"
              className="pl-8"
            />
          </search>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
            <SelectTrigger id="ledger-status" className="w-40" aria-label="Status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {(filtered || sort) && rows.length > 0 && (
            <Button variant="ghost" size="sm" className="h-9" onClick={clearAndFocus}>Clear filters</Button>
          )}
          <span hidden data-lab="ledger-filter" onClick={() => { setQuery("north"); setPage(0) }} />
          <span hidden data-lab="ledger-empty" onClick={() => { setQuery("zzzz"); setPage(0) }} />
          <span hidden data-lab="ledger-clear" onClick={clear} />
          <span hidden data-lab="ledger-sort" onClick={() => toggleSort("amount")} />
        </div>

        {/* One polite status for count, sort and page, so a screen reader hears what changed. */}
        <p role="status" className="sr-only">{summary}</p>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center">
            <p className="font-medium">No invoices match</p>
            <p className="text-muted-foreground max-w-prose text-sm text-pretty [overflow-wrap:anywhere]">
              {query.trim() ? <>Nothing matches “{query.trim()}”</> : "Nothing here"}
              {status !== "all" ? <> with status {status}</> : null}. Search looks at client, project and invoice ID.
            </p>
            <Button variant="outline" size="sm" className="mt-1" onClick={clearAndFocus}>Clear filters</Button>
          </div>
        ) : (
          <>
            <Table className="min-w-[44rem]">
              <caption className="sr-only">Ledger: {summary}</caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col" className="text-muted-foreground w-20">Invoice</TableHead>
                  {sortHead("client", "Client")}
                  <TableHead scope="col" className="text-muted-foreground">Project</TableHead>
                  {sortHead("hours", "Hours", true)}
                  {sortHead("amount", "Amount", true)}
                  <TableHead scope="col" className="text-muted-foreground">Status</TableHead>
                  {sortHead("due", "Due")}
                </TableRow>
              </TableHeader>
              <TableBody className="[&_td]:align-top [&_td]:py-2.5 [&_th]:align-top [&_th]:py-2.5">
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <th scope="row" className="px-2 text-left font-medium whitespace-nowrap tabular-nums">{r.id}</th>
                    {/* Client is the identifying field, so it wraps instead of truncating behind a tooltip.
                        overflow-wrap: anywhere lets the unbroken email break at any point. */}
                    <TableCell className="max-w-60 min-w-40 whitespace-normal text-pretty [overflow-wrap:anywhere]">{r.client}</TableCell>
                    <TableCell className={cn("max-w-56 min-w-36 whitespace-normal text-pretty", !r.project && "text-muted-foreground")}>
                      {r.project ?? (r.status === "Credit" ? "Not tied to a project" : "No project")}
                    </TableCell>
                    <TableCell className={cn("text-right tabular-nums", !r.hours && "text-muted-foreground")}>
                      {r.hours === null ? <><span aria-hidden>—</span><span className="sr-only">Not applicable</span></> : hoursFmt.format(r.hours)}
                    </TableCell>
                    <TableCell className={cn("text-right tabular-nums", r.amount === 0 && "text-muted-foreground")}>
                      {money(r.amount)}
                    </TableCell>
                    <TableCell><Badge variant={statusVariant[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell className={cn("tabular-nums", !r.due && "text-muted-foreground")}>
                      {r.due ?? (r.status === "Credit" ? "No due date" : "Set when sent")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* The total covers every matching entry, not only this page, and says so. */}
              <tfoot className="bg-muted/40 border-t font-medium">
                <tr>
                  <th scope="row" colSpan={4} className="px-2 py-2.5 text-left font-medium">
                    Total
                    <span className="text-muted-foreground ml-2 font-normal">
                      {rows.length} {rows.length === 1 ? "entry" : "entries"}{pages > 1 ? ", all pages" : ""}
                      {credits ? `, net of ${credits === 1 ? "1 credit" : `${credits} credits`}` : ""}
                    </span>
                  </th>
                  <td className="px-2 py-2.5 text-right whitespace-nowrap tabular-nums">{money(total)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </Table>
            <nav aria-label="Ledger pages" className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground tabular-nums">
                {start + 1}–{start + visible.length} of {rows.length} {what}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground tabular-nums" aria-hidden>Page {current + 1} of {pages}</span>
                <Button ref={prevRef} variant="outline" size="sm" data-lab="ledger-prev" disabled={current === 0} onClick={() => goTo(current - 1)}><ChevronLeft aria-hidden /> Previous</Button>
                <Button ref={nextRef} variant="outline" size="sm" data-lab="ledger-next" disabled={current >= pages - 1} onClick={() => goTo(current + 1)}>Next <ChevronRight aria-hidden /></Button>
              </div>
            </nav>
          </>
        )}
      </CardContent>
    </Card>
  )
}
