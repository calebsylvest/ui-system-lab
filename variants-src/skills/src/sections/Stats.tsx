import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const stats = [
  { label: "Billable hours", value: "42.5", note: "of 60 target", progress: 71 },
  { label: "Outstanding", value: "$15,400", note: "3 invoices", progress: null },
  { label: "Overdue", value: "$5,200", note: "1 invoice, 28 days", progress: null },
  { label: "Utilization", value: "78%", note: "team average", progress: 78 },
]

export function Stats() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="gap-2">
          <CardHeader>
            <CardDescription>{s.label}</CardDescription>
            <CardTitle as="p" className="text-2xl tabular-nums">{s.value}</CardTitle>
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
