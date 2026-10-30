import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { TopNav } from "@/sections/TopNav"
import { Sidebar } from "@/sections/Sidebar"
import { PageHeader } from "@/sections/PageHeader"
import { Stats } from "@/sections/Stats"
import { Workspace } from "@/sections/Workspace"
import { RoundTwo } from "@/sections/RoundTwo"
import { Settings } from "@/sections/Settings"
import { Controls } from "@/sections/Controls"
import { States } from "@/sections/States"
import { Assistant } from "@/sections/Assistant"

export default function App() {
  return (
    <TooltipProvider>
      {/* Framed sheet: sidebar and top bar share one tinted L; the work sits on a white sheet
          inset 8px from the right and bottom, 16px corners, 1px edge, no shadow.
          Grid sum inside the sheet at 1440: 1440 - 228 sidebar - 8 inset = 1204 sheet;
          content max 1200 incl. 2 x 24 padding = 1152 = 4 x 270 + 3 x 24 (KPIs) = 2 x 564 + 24. */}
      <div className="min-h-screen lg:grid lg:grid-cols-[228px_minmax(0,1fr)]">
        <Sidebar />
        <div className="flex min-w-0 flex-col lg:pr-2 lg:pb-2">
          <TopNav />
          <div className="bg-background flex-1 border-sheet-edge border-t lg:rounded-2xl lg:border">
      <main className="mx-auto grid max-w-[1200px] gap-10 px-4 pt-6 pb-10 sm:px-6">
        <PageHeader />
        <Stats />
        <Workspace />
        <RoundTwo />
        <div className="grid gap-6 lg:grid-cols-2">
          <Controls />
          <Assistant />
        </div>
        <States />
        <Settings />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>Fieldwork Studio · Plano, TX</span>
          <span>Variant: taste-skill</span>
        </div>
      </footer>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  )
}
