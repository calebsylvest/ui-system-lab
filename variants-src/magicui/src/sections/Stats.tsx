import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { NumberTicker } from "@/components/ui/number-ticker"

const stats = [
  { label: "Billable hours", value: 42.5, decimals: 1, prefix: "", suffix: "", note: "of 60 target", progress: 71 },
  { label: "Outstanding", value: 15400, decimals: 0, prefix: "$", suffix: "", note: "3 invoices", progress: null },
  { label: "Overdue", value: 5200, decimals: 0, prefix: "$", suffix: "", note: "1 invoice, 28 days", progress: null },
  { label: "Utilization", value: 78, decimals: 0, prefix: "", suffix: "%", note: "team average", progress: 78 },
]

export function Stats() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="gap-2">
          <CardHeader>
            <CardDescription>{s.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              <span className="sr-only">{`${s.prefix}${s.value.toLocaleString("en-US", { minimumFractionDigits: s.decimals })}${s.suffix}`}</span>
              <span aria-hidden="true">
                {s.prefix}
                <NumberTicker value={s.value} decimalPlaces={s.decimals} delay={0.15} className="tracking-normal text-card-foreground dark:text-card-foreground" />
                {s.suffix}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <p className="text-muted-foreground text-xs">{s.note}</p>
            {s.progress !== null && <Progress value={s.progress} />}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
