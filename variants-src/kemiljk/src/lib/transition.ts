import { flushSync } from "react-dom"

// Layout continuity for list changes (fluid-design #5/#7) using the native View Transitions API.
// Falls back to an instant update when unsupported or when the person prefers reduced motion.
export function withTransition(update: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (reduce || typeof document.startViewTransition !== "function") {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}
