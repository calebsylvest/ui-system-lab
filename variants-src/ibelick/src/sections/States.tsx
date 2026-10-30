import { useState } from "react"
import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { faqs } from "@/data"

export function States() {
  const [loading, setLoading] = useState(true)

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle as="h2">Archived projects</CardTitle>
          <CardDescription>Empty state</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <FolderOpen className="size-8 text-muted-foreground" />
          <div>
            <p className="font-medium">No archived projects</p>
            <p className="text-muted-foreground text-sm text-pretty">Projects you archive show up here. Nothing is deleted.</p>
          </div>
          <Button variant="outline" size="sm">View active projects</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Recent files</CardTitle>
          <CardDescription>Loading state</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <ul aria-busy={loading} aria-label="Recent files" className="grid gap-3">
          {loading ? (
            [0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="sr-only">Loading file</span>
                <Skeleton className="size-10" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </li>
            ))
          ) : (
            [
              ["catalog-cover-v3.fig", "Maya R. · 2.4 MB"],
              ["donor-portal-flows.pdf", "Jonah O. · 880 KB"],
              ["menu-board-photos.zip", "Lena T. · 41 MB"],
            ].map(([f, m]) => (
              <li key={f} className="flex items-center gap-3">
                <div aria-hidden="true" className="size-10 shrink-0 rounded-md bg-muted" />
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium">{f}</p>
                  <p className="text-muted-foreground text-xs tabular-nums">{m}</p>
                </div>
              </li>
            ))
          )}
          </ul>
          <Button variant="ghost" size="sm" onClick={() => setLoading(!loading)}>
            {loading ? "Finish loading" : "Show loading again"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Questions</CardTitle>
          <CardDescription>Accordion</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="q0">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  )
}
