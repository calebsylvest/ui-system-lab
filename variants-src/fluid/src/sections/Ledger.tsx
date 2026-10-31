import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { ledger, type LedgerRow } from "@/data-r3"
import { statusColor } from "@/data-status"
import { Badge, type BadgeColor } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField, InputGroup } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fontWeights } from "@/lib/font-weight"
import { useSize } from "@/lib/size-context"
import { cn } from "@/lib/utils"

type SortKey = "client" | "hours" | "amount" | "due"
type Sort = { key: SortKey; dir: "asc" | "desc" } | null

const PAGE = 6
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })
// Fluid badges are colored dots; Credit is the one status the round-1 map didn't have.
const ledgerColor: Record<LedgerRow["status"], BadgeColor> = { ...statusColor, Credit: "violet" } as Record<LedgerRow["status"], BadgeColor>
const statuses = ["Paid", "Sent", "Overdue", "Draft", "Credit"] as const

// A missing value reads as "None" to assistive tech instead of "em dash".
const Missing = () => (<><span aria-hidden>—</span><span className="sr-only">None</span></>)

// Round-3 section: a data table with messy content. Search, status filter, sortable
// columns, pagination, a no-results state and a totals row.
//
// Fluid treatment (see CHANGES.md, Round 3): Fluid Table (one gliding row highlight, muted
// cells that lift to foreground on the lit row), InputField search with its icon slot, the
// bordered Fluid Select, dot Badges, ghost/tertiary compact Buttons, type roles + tabular figures.
export function Ledger() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [sort, setSort] = useState<Sort>(null)
  const [page, setPage] = useState(0)
  const size = useSize()

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
  const count = `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`

  function toggleSort(key: SortKey) {
    setPage(0)
    setSort((s) => (!s || s.key !== key ? { key, dir: key === "client" ? "asc" : "desc" } : s.dir === "desc" ? { key, dir: "asc" } : s.dir === "asc" && key === "client" ? { key, dir: "desc" } : null))
  }
  const clear = () => { setQuery(""); setStatus("all"); setSort(null); setPage(0) }

  // A render function, not a component: a component defined inside Ledger would remount its
  // button on every sort and drop keyboard focus.
  const sortHead = (k: SortKey, label: string, numeric = false) => {
    const active = sort?.key === k
    const Icon = !active ? ArrowUpDown : sort!.dir === "asc" ? ArrowUp : ArrowDown
    return (
      <TableHead className={cn("whitespace-nowrap", numeric && "text-right")} aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}>
        {/* Compact ghost button pulled into the cell padding so its label lines up with the
            column's text; -my-1 keeps the header row on the 36px ladder. Numeric columns put
            the arrow first so the label stays flush with the right-aligned figures. */}
        <Button
          variant="ghost"
          size="compact"
          active={active}
          className={cn("-my-1", numeric ? "-mr-3" : "-ml-3")}
          {...(numeric ? { leadingIcon: Icon } : { trailingIcon: Icon })}
          data-lab={`ledger-sort-${k}`}
          onClick={() => toggleSort(k)}
        >
          {label}
        </Button>
      </TableHead>
    )
  }

  const statusLabel = status === "all" ? null : status
  const emptyCopy = query.trim()
    ? `Nothing matches “${query.trim()}”${statusLabel ? ` with status ${statusLabel}` : ""}.`
    : `No invoices have status ${statusLabel}.`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ledger</CardTitle>
        <CardDescription>All invoices and credits. Search, filter, sort and page through them.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-end gap-2">
          <InputGroup className="min-w-56 w-auto flex-1">
            <InputField index={0} id="ledger-search" label="Search ledger" labelHidden icon={Search}
              placeholder="Search client, project or ID" value={query}
              onChange={(v) => { setQuery(v); setPage(0) }} />
          </InputGroup>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
            <SelectTrigger id="ledger-status" variant="bordered" className="w-40" aria-label="Status" />
            <SelectContent>
              <SelectItem index={0} value="all">All statuses</SelectItem>
              {statuses.map((s, i) => <SelectItem key={s} index={i + 1} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <span hidden data-lab="ledger-filter" onClick={() => { setQuery("north"); setPage(0) }} />
          <span hidden data-lab="ledger-empty" onClick={() => { setQuery("zzzz"); setPage(0) }} />
          <span hidden data-lab="ledger-clear" onClick={clear} />
          <span hidden data-lab="ledger-sort" onClick={() => toggleSort("amount")} />
        </div>

        {/* Result count for screen readers, so filtering isn't silent. */}
        <p className="sr-only" role="status">{rows.length === 0 ? "No invoices match" : count}</p>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-10 text-center">
            <p className={cn(size.type.body, "text-foreground")} style={{ fontVariationSettings: fontWeights.semibold }}>No invoices match</p>
            <p className={cn(size.type.body, "text-muted-foreground")}>{emptyCopy}</p>
            <Button variant="tertiary" size="compact" className="mt-3" onClick={clear}>Clear filters</Button>
          </div>
        ) : (
          <>
            {/* Fluid's Table has no scroll container of its own (shadcn's did). */}
            <div className="-mx-3 overflow-x-auto px-3">
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
                  {visible.map((r, i) => (
                    <TableRow key={r.id} index={i}>
                      <TableCell className="whitespace-nowrap tabular-nums">{r.id}</TableCell>
                      <TableCell className="max-w-56 truncate" title={r.client}>{r.client}</TableCell>
                      <TableCell className="max-w-48 truncate" title={r.project ?? undefined}>{r.project ?? <Missing />}</TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular-nums">{r.hours ?? <Missing />}</TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular-nums">{money(r.amount)}</TableCell>
                      <TableCell><Badge variant="dot" color={ledgerColor[r.status]}>{r.status}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">{r.due ?? <Missing />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {/* Totals: no index, so it never lights up; header rows render semibold. */}
                <tfoot>
                  <TableRow className="border-b-0">
                    <TableCell colSpan={4} style={{ fontVariationSettings: fontWeights.normal }}>{count}</TableCell>
                    <TableCell className="text-foreground text-right whitespace-nowrap tabular-nums">{money(total)}</TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </tfoot>
              </Table>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className={cn(size.type.caption, "text-muted-foreground tabular-nums")}>Page {current + 1} of {pages}</span>
              <div className="flex gap-1">
                <Button variant="tertiary" size="compact" leadingIcon={ChevronLeft} data-lab="ledger-prev" disabled={current === 0} onClick={() => setPage(current - 1)}>Previous</Button>
                <Button variant="tertiary" size="compact" trailingIcon={ChevronRight} data-lab="ledger-next" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
