import { useState } from "react"
import { ChevronDown, FileArchive, FileImage, FileText, FolderOpen } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { faqs } from "@/data"

export function States() {
  const [loading, setLoading] = useState(true)

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle as="h2">Archived projects</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <FolderOpen aria-hidden className="size-8 text-muted-foreground" />
          <div>
            <p className="font-medium">No archived projects</p>
            <p className="text-muted-foreground text-sm">Projects you archive show up here. Nothing is deleted.</p>
          </div>
          {/* It goes somewhere, so it is a link (styled as a button), not a button that does nothing. */}
          <a href="#workspace" className={buttonVariants({ variant: "outline", size: "sm" })}>View active projects</a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Recent files</CardTitle>
          <CardDescription>Uploaded by the team this week</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3" aria-busy={loading}>
          {loading && <span role="status" className="sr-only">Loading recent files</span>}
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} aria-hidden className="flex items-center gap-3">
                <Skeleton className="size-10" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-4 w-3/4" />
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
              <div key={f} className="flex items-center gap-3">
                {/* The file type is real information; an empty grey square was filler. */}
                <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><Icon aria-hidden className="size-5" /></div>
                <div className="text-sm">
                  <p className="font-medium">{f}</p>
                  <p className="text-muted-foreground text-xs">{m}</p>
                </div>
              </div>
            ))
          )}
          <Button variant="ghost" size="sm" onClick={() => setLoading(!loading)}>
            {loading ? "Finish loading" : "Show loading again"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h2">Questions</CardTitle>
          <CardDescription>Billing, sharing and project basics</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Native exclusive accordion: <details name> needs no JS for keyboard, state or search-in-page. */}
          <div className="faq">
            {faqs.map((f, i) => (
              <details key={i} name="faq" open={i === 0} className="group border-b last:border-b-0">
                <summary className="flex cursor-pointer items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  {f.q}
                  <ChevronDown aria-hidden className="chev mt-0.5 size-4 shrink-0 text-muted-foreground" />
                </summary>
                <p className="pb-4 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
