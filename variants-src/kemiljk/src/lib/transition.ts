import { flushSync } from "react-dom"

// Layout continuity for list changes (fluid-design #5/#7) using the native View Transitions API.
// Falls back to an instant update when unsupported or when the person prefers reduced motion.
//
// `scope` names which list is changing. It is set as `data-vt` on <html> for the length of the
// transition, and CSS only gives elements of that list a view-transition-name while it matches
// (see index.css). Before round 3, every project card always had a name, so a task change also
// captured and animated the whole project grid.
let current = 0
export type TransitionScope = "projects" | "tasks"

export function withTransition(update: () => void, scope: TransitionScope) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (reduce || typeof document.startViewTransition !== "function") {
    update()
    return
  }
  const root = document.documentElement
  const token = ++current
  root.dataset.vt = scope
  const vt = document.startViewTransition(() => flushSync(update))
  vt.finished.finally(() => {
    // A newer transition may have replaced this one; only the latest clears the scope.
    if (token === current) delete root.dataset.vt
  })
}
