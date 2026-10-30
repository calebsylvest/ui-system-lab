import { Tasks } from "@/sections/Tasks"
import { QuickActions } from "@/sections/QuickActions"
import { SyncStates } from "@/sections/SyncStates"

// Round-2 sections, grouped so every variant can mount them with one line.
// taste-skill: the style's one 24px gutter between cards, as in the rest of the sheet (framed-sheet avoid list).
export function RoundTwo() {
  return (
    <section className="grid gap-6" aria-label="Tasks, quick actions and sync">
      <div className="grid gap-6 lg:grid-cols-2">
        <Tasks />
        <SyncStates />
      </div>
      <QuickActions />
    </section>
  )
}
