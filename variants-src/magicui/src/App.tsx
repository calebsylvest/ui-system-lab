import { MotionConfig } from "motion/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BlurFade } from "@/components/ui/blur-fade"
import { Toaster } from "@/components/ui/sonner"
import { TopNav } from "@/sections/TopNav"
import { PageHeader } from "@/sections/PageHeader"
import { Stats } from "@/sections/Stats"
import { Workspace } from "@/sections/Workspace"
import { Settings } from "@/sections/Settings"
import { Controls } from "@/sections/Controls"
import { States } from "@/sections/States"
import { Assistant } from "@/sections/Assistant"

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <TooltipProvider>
      <TopNav />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
        <BlurFade delay={0}><PageHeader /></BlurFade>
        <BlurFade delay={0.08}><Stats /></BlurFade>
        <BlurFade delay={0.16}><Workspace /></BlurFade>
        <BlurFade inView className="grid gap-4 lg:grid-cols-2">
          <Controls />
          <Assistant />
        </BlurFade>
        <BlurFade inView><States /></BlurFade>
        <BlurFade inView><Settings /></BlurFade>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-sm text-muted-foreground">
          <span>Fieldwork Studio · Plano, TX</span>
          <span>Variant: Magic UI</span>
        </div>
      </footer>
      <Toaster position="bottom-right" />
    </TooltipProvider>
    </MotionConfig>
  )
}
