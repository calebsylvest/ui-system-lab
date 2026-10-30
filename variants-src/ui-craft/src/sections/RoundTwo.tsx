import { Tasks } from "@/sections/Tasks"
import { QuickActions } from "@/sections/QuickActions"
import { SyncStates } from "@/sections/SyncStates"

// Round-2 sections, grouped so every variant can mount them with one line.
export function RoundTwo() {
  return (
    <section className="grid gap-4" aria-label="Tasks, quick actions and sync">
      <div className="grid gap-4 lg:grid-cols-2">
        <Tasks />
        <SyncStates />
      </div>
      <QuickActions />
    </section>
  )
}
