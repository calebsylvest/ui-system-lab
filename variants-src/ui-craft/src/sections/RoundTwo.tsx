import { MotionConfig } from "motion/react"
import { Tasks } from "@/sections/Tasks"
import { QuickActions } from "@/sections/QuickActions"
import { SyncStates } from "@/sections/SyncStates"

// Round-2 sections, grouped so every variant can mount them with one line.
// MotionConfig makes Motion's JS animations honour prefers-reduced-motion, which the global CSS rule can't reach.
export function RoundTwo() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="grid gap-4" aria-label="Tasks, quick actions and sync">
        <div className="grid gap-4 lg:grid-cols-2">
          <Tasks />
          <SyncStates />
        </div>
        <QuickActions />
      </section>
    </MotionConfig>
  )
}
