import { Progress } from "@/components/ui/progress"
import { outstandingTotal, overdueInvoices, overdueTotal, unpaidInvoices } from "@/data"

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

// Label above value, value at 400, unit as a smaller grey suffix, no icons, no sparklines.
// One container split by 1px lines instead of four tiles (app-screens.md 5).
const stats = [
  { label: "Billable hours", value: "42.5", unit: "h", note: "of 60 h target", progress: 71, tone: "" },
  { label: "Outstanding", value: money(outstandingTotal), unit: "", note: `${unpaidInvoices.length} invoices unpaid`, progress: null, tone: "" },
  { label: "Overdue", value: money(overdueTotal), unit: "", note: `${overdueInvoices.length} invoice, 28 days late`, progress: null, tone: "text-negative" },
  { label: "Utilization", value: "78", unit: "%", note: "team average", progress: 78, tone: "" },
]

export function Stats() {
  return (
    <section aria-label="This week" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-card grid content-start gap-2 p-5">
          <p className="text-muted-foreground text-sm font-medium">{s.label}</p>
          <p className="text-[28px] leading-8 font-normal tracking-[-0.02em]">
            {s.value}{s.unit && <span className="text-muted-foreground ml-0.5 text-base tracking-normal">{s.unit}</span>}
          </p>
          <p className={`text-xs ${s.tone || "text-muted-foreground"}`}>{s.note}</p>
          {s.progress !== null && <Progress value={s.progress} aria-label={`${s.label} ${s.progress}%`} />}
        </div>
      ))}
    </section>
  )
}
