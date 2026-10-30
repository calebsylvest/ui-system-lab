import { useState } from "react"
import { FileArchive, FileImage, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { faqs } from "@/data"

export function States() {
  const [loading, setLoading] = useState(true)

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Archived projects</CardTitle>
          <CardDescription>Empty state</CardDescription>
        </CardHeader>
        {/* An empty block keeps its frame and header and says one sentence; no illustration (app-screens.md 11). */}
        <CardContent className="flex flex-1 flex-col gap-4">
          <p className="text-muted-foreground rounded-lg border border-dashed border-input px-4 py-3 text-sm">
            <span className="text-foreground font-medium">No archived projects.</span> Projects you archive show up here. Nothing is deleted.
          </p>
          <Button variant="outline" size="sm" className="mt-auto self-start">View active projects</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent files</CardTitle>
          <CardDescription>Loading state</CardDescription>
        </CardHeader>
        {/* Loading keeps the final layout: flat grey bars at the real sizes, no shimmer, no shift. */}
        <CardContent className="flex flex-1 flex-col gap-1">
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="flex h-11 items-start gap-3 pt-0.5">
                <Skeleton className="mt-0.5 size-4" />
                <div className="grid flex-1 gap-1.5 pt-0.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            ([
              ["catalog-cover-v3.fig", "Maya R. · 2.4 MB", FileImage],
              ["donor-portal-flows.pdf", "Jonah O. · 880 KB", FileText],
              ["menu-board-photos.zip", "Lena T. · 41 MB", FileArchive],
            ] as const).map(([f, m, Icon]) => (
              <div key={f} className="flex h-11 items-start gap-3">
                <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" strokeWidth={1.6} />
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium leading-5">{f}</p>
                  <p className="text-muted-foreground text-xs leading-4">{m}</p>
                </div>
              </div>
            ))
          )}
          <Button variant="ghost" size="sm" className="mt-auto self-start" onClick={() => setLoading(!loading)}>
            {loading ? "Finish loading" : "Show loading again"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
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
