import { LucideProvider } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { TopNav } from "@/sections/TopNav"
import { PageHeader } from "@/sections/PageHeader"
import { Stats } from "@/sections/Stats"
import { Workspace } from "@/sections/Workspace"
import { RoundTwo } from "@/sections/RoundTwo"
import { RoundThree } from "@/sections/RoundThree"
import { Settings } from "@/sections/Settings"
import { Controls } from "@/sections/Controls"
import { States } from "@/sections/States"
import { Assistant } from "@/sections/Assistant"

export default function App() {
  return (
    // better-ui: icon strokes render at a fixed 2px next to medium-weight labels, whatever the icon size
    <LucideProvider strokeWidth={2} nonScalingStroke>
    <TooltipProvider>
      <a href="#main" className="fixed top-3 -start-[999px] z-50 rounded-md bg-background px-3 py-2 text-sm font-medium shadow-md focus:start-3">
        Skip to content
      </a>
      <TopNav />
      <main id="main" className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
        <PageHeader />
        <Stats />
        <Workspace />
        <RoundTwo />
        <RoundThree />
        <div className="grid gap-4 lg:grid-cols-2">
          <Controls />
          <Assistant />
        </div>
        <States />
        <Settings />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-muted-foreground">
          <span>Fieldwork Studio · Alder Bay</span>
          <span>Variant: Interface skills (better-interface)</span>
        </div>
      </footer>
      <Toaster position="bottom-right" />
    </TooltipProvider>
    </LucideProvider>
  )
}
