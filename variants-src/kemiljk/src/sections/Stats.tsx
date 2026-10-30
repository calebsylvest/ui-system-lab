import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { invoices } from "@/data"

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const unpaid = invoices.filter((i) => i.status !== "Paid")
const overdue = invoices.filter((i) => i.status === "Overdue")
const sum = (xs: typeof invoices) => xs.reduce((t, i) => t + i.amount, 0)
const count = (n: number) => `${n} invoice${n === 1 ? "" : "s"}`

// Money figures are derived from the invoice list so the summary and the table agree.
const stats = [
  { label: "Billable hours", value: "42.5", note: "of 60 target", progress: 71 },
  { label: "Outstanding", value: money(sum(unpaid)), note: `${count(unpaid.length)}, incl. ${unpaid.filter((i) => i.status === "Draft").length} draft`, progress: null },
  { label: "Overdue", value: money(sum(overdue)), note: `${count(overdue.length)}, 28 days`, progress: null, urgent: true },
  { label: "Utilization", value: "78%", note: "team average", progress: 78 },
]

export function Stats() {
  return (
    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">This week</h2>
      {/* A description list: each figure is a value for a named term, not a heading. */}
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="gap-1 px-6 py-5">
            <dt className="text-muted-foreground text-sm">{s.label}</dt>
            <dd className={`text-2xl font-semibold tabular-nums ${"urgent" in s ? "text-destructive" : ""}`}>{s.value}</dd>
            <dd className="text-muted-foreground mt-1 text-xs">{s.note}</dd>
            {s.progress !== null && <dd className="mt-2"><Progress value={s.progress} aria-label={`${s.label}: ${s.progress}%`} /></dd>}
          </Card>
        ))}
      </dl>
    </section>
  )
}
